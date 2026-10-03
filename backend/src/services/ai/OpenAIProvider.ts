import { ChatMessageInput } from "../../types";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { AIProvider, StreamChatOptions, StreamChunk } from "./AIProvider";

/**
 * Talks to any OpenAI-compatible Chat Completions API (OpenAI itself,
 * Azure OpenAI, OpenRouter, a local Ollama/vLLM server, etc.) using
 * plain fetch — no vendor SDK required, which keeps this provider easy
 * to read and to swap out.
 */
export class OpenAIProvider implements AIProvider {
  constructor(private readonly apiKey: string, private readonly baseUrl: string) {}

  private headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async *streamChat(
    messages: ChatMessageInput[],
    options: StreamChatOptions
  ): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      signal: options.signal,
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => "");
      logger.error("AI provider error", response.status, text);
      throw ApiError.internal(
        "The AI service is currently unavailable. Please try again."
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice("data:".length).trim();
          if (payload === "[DONE]") return;

          try {
            const json = JSON.parse(payload);
            const delta: string | undefined = json.choices?.[0]?.delta?.content;
            if (delta) yield { delta };
          } catch {
            // Ignore malformed / keep-alive SSE lines.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async complete(
    messages: ChatMessageInput[],
    options: StreamChatOptions
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      signal: options.signal,
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.3,
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      logger.error("AI provider error", response.status, text);
      throw ApiError.internal(
        "The AI service is currently unavailable. Please try again."
      );
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content?.trim() ?? "";
  }
}

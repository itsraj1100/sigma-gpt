import { env } from "../../config/env";
import { ChatMessageInput } from "../../types";
import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./OpenAIProvider";

/**
 * Single place that decides which AIProvider implementation is active.
 * To add a new provider: implement AIProvider, then branch on an env
 * var here (e.g. AI_PROVIDER=azure). Nothing outside this file needs
 * to change.
 */
function createProvider(): AIProvider {
  return new OpenAIProvider(env.aiApiKey, env.aiBaseUrl);
}

const provider = createProvider();

export const aiService = {
  streamChat(messages: ChatMessageInput[], signal?: AbortSignal) {
    return provider.streamChat(messages, { model: env.aiModel, signal });
  },

  async generateTitle(firstUserMessage: string): Promise<string | null> {
    try {
      const raw = await provider.complete(
        [
          {
            role: "system",
            content:
              "Generate a short chat title (3-6 words, no quotes, no punctuation at the end) that summarizes the user's request. Reply with the title only.",
          },
          { role: "user", content: firstUserMessage.slice(0, 2000) },
        ],
        { model: env.aiTitleModel, temperature: 0.3 }
      );
      const cleaned = raw.replace(/^["'“”]+|["'“”]+$/g, "").trim();
      return cleaned || null;
    } catch {
      // Title generation is best-effort and must never break the chat flow.
      return null;
    }
  },
};

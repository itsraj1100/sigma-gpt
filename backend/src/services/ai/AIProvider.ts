import { ChatMessageInput } from "../../types";

export interface StreamChatOptions {
  model: string;
  temperature?: number;
  signal?: AbortSignal;
}

export interface StreamChunk {
  /** Incremental text since the last chunk. */
  delta: string;
}

/**
 * Every LLM backend (OpenAI, Azure OpenAI, a local vLLM/Ollama server,
 * Anthropic via an OpenAI-compatible shim, etc.) implements this
 * interface. Controllers and services depend only on this contract,
 * never on a specific SDK — swap providers by changing one file.
 */
export interface AIProvider {
  /** Streams the assistant's reply as an async sequence of text deltas. */
  streamChat(
    messages: ChatMessageInput[],
    options: StreamChatOptions
  ): AsyncGenerator<StreamChunk>;

  /** Non-streaming helper used for cheap tasks like title generation. */
  complete(messages: ChatMessageInput[], options: StreamChatOptions): Promise<string>;
}

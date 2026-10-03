import { env } from "../config/env";
import { ChatMessageInput } from "../types";

interface DbMessage {
  role: string;
  content: string;
}

/**
 * Responsible for turning raw stored messages into the message array
 * sent to the LLM: adds the system prompt, keeps only the most recent
 * N messages, and trims further by an approximate character budget so
 * we never blow past the model's context window.
 */
export const contextService = {
  buildContext(history: DbMessage[]): ChatMessageInput[] {
    const recent = history.slice(-env.aiMaxHistoryMessages);

    const trimmed: ChatMessageInput[] = [];
    let charBudget = env.aiMaxContextChars;

    // Walk backwards so we always keep the most recent messages when
    // the character budget forces us to drop older ones.
    for (let i = recent.length - 1; i >= 0; i--) {
      const msg = recent[i];
      if (msg.content.length > charBudget && trimmed.length > 0) break;
      charBudget -= msg.content.length;
      trimmed.unshift({
        role: msg.role as ChatMessageInput["role"],
        content: msg.content,
      });
    }

    return [{ role: "system", content: env.aiSystemPrompt }, ...trimmed];
  },
};

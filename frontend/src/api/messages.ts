import { apiClient } from "./client";
import { Message } from "../types";

export const messagesApi = {
  async list(conversationId: string) {
    const res = await apiClient.get<{ data: { messages: Message[] } }>(
      `/conversations/${conversationId}/messages`
    );
    return res.data.data.messages;
  },
};

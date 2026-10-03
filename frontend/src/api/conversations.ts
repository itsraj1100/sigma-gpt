import { apiClient } from "./client";
import { Conversation } from "../types";

export const conversationsApi = {
  async list() {
    const res = await apiClient.get<{ data: { conversations: Conversation[] } }>(
      "/conversations"
    );
    return res.data.data.conversations;
  },

  async search(query: string) {
    const res = await apiClient.get<{ data: { conversations: Conversation[] } }>(
      "/conversations/search",
      { params: { q: query } }
    );
    return res.data.data.conversations;
  },

  async create(title?: string) {
    const res = await apiClient.post<{ data: { conversation: Conversation } }>(
      "/conversations",
      { title }
    );
    return res.data.data.conversation;
  },

  async rename(id: string, title: string) {
    const res = await apiClient.patch<{ data: { conversation: Conversation } }>(
      `/conversations/${id}`,
      { title }
    );
    return res.data.data.conversation;
  },

  async remove(id: string) {
    await apiClient.delete(`/conversations/${id}`);
  },
};

import { conversationRepository } from "../repositories/conversationRepository";
import { ApiError } from "../utils/ApiError";

export const conversationService = {
  list(userId: string) {
    return conversationRepository.listByUser(userId);
  },

  search(userId: string, query: string) {
    return conversationRepository.search(userId, query);
  },

  create(userId: string, title?: string) {
    return conversationRepository.create(userId, title);
  },

  async getOwned(conversationId: string, userId: string) {
    const conversation = await conversationRepository.findByIdForUser(
      conversationId,
      userId
    );
    if (!conversation) {
      // 404 rather than 403: don't reveal whether the id exists at all.
      throw ApiError.notFound("Conversation not found.");
    }
    return conversation;
  },

  async rename(conversationId: string, userId: string, title: string) {
    await this.getOwned(conversationId, userId);
    return conversationRepository.rename(conversationId, title);
  },

  async remove(conversationId: string, userId: string) {
    await this.getOwned(conversationId, userId);
    await conversationRepository.delete(conversationId);
  },
};

import { messageRepository } from "../repositories/messageRepository";
import { conversationService } from "./conversationService";
import { ChatRole } from "../types";

export const messageService = {
  async list(conversationId: string, userId: string) {
    await conversationService.getOwned(conversationId, userId);
    return messageRepository.listByConversation(conversationId);
  },

  async create(
    conversationId: string,
    userId: string,
    role: ChatRole,
    content: string
  ) {
    await conversationService.getOwned(conversationId, userId);
    return messageRepository.create(conversationId, role, content);
  },
};

import { prisma } from "../config/db";
import { ChatRole } from "../types";

export const messageRepository = {
  listByConversation(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  },

  create(
    conversationId: string,
    role: ChatRole,
    content: string,
    extra?: { model?: string; tokenUsage?: number }
  ) {
    return prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        model: extra?.model,
        tokenUsage: extra?.tokenUsage,
      },
    });
  },

  update(id: string, content: string) {
    return prisma.message.update({ where: { id }, data: { content } });
  },

  findById(id: string) {
    return prisma.message.findUnique({ where: { id } });
  },

  /** Deletes every message created strictly after `createdAt` (used for edit-and-resend). */
  deleteAfter(conversationId: string, createdAt: Date) {
    return prisma.message.deleteMany({
      where: { conversationId, createdAt: { gt: createdAt } },
    });
  },

  deleteLastAssistantMessage(conversationId: string) {
    return prisma.message
      .findFirst({
        where: { conversationId, role: "assistant" },
        orderBy: { createdAt: "desc" },
      })
      .then((msg) =>
        msg ? prisma.message.delete({ where: { id: msg.id } }) : null
      );
  },

  countByConversation(conversationId: string) {
    return prisma.message.count({ where: { conversationId } });
  },
};

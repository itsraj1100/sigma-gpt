import { prisma } from "../config/db";

export const conversationRepository = {
  listByUser(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  },

  search(userId: string, query: string) {
    return prisma.conversation.findMany({
      where: {
        userId,
        title: { contains: query, mode: "insensitive" },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.conversation.findFirst({ where: { id, userId } });
  },

  create(userId: string, title?: string) {
    return prisma.conversation.create({
      data: { userId, title: title?.trim() || "New Chat" },
    });
  },

  rename(id: string, title: string) {
    return prisma.conversation.update({ where: { id }, data: { title } });
  },

  touch(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  },

  delete(id: string) {
    return prisma.conversation.delete({ where: { id } });
  },
};

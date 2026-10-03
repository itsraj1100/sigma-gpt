import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200),
});

export const searchConversationsSchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

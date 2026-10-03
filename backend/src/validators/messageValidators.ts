import { z } from "zod";
import { env } from "../config/env";

export const createMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().trim().min(1).max(env.maxMessageLength),
});

export const chatRequestSchema = z
  .object({
    content: z.string().trim().max(env.maxMessageLength).optional(),
    regenerate: z.boolean().optional(),
    editMessageId: z.string().uuid().optional(),
  })
  .refine(
    (data) => Boolean(data.content) || data.regenerate || data.editMessageId,
    { message: "Provide a message, or set regenerate / editMessageId." }
  );

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

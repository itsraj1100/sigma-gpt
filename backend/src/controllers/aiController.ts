import { Request, Response } from "express";
import { env } from "../config/env";
import { conversationService } from "../services/conversationService";
import { conversationRepository } from "../repositories/conversationRepository";
import { messageRepository } from "../repositories/messageRepository";
import { contextService } from "../services/contextService";
import { aiService } from "../services/ai/aiService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { fallbackTitle } from "../utils/text";
import { logger } from "../utils/logger";
import { ChatRequestInput } from "../validators/messageValidators";

/** Fires off (without awaiting) a best-effort AI title generation for a new conversation. */
function generateTitleInBackground(conversationId: string, firstMessage: string) {
  aiService
    .generateTitle(firstMessage)
    .then((title) =>
      conversationRepository.rename(conversationId, title || fallbackTitle(firstMessage))
    )
    .catch((err) => logger.warn("Title generation failed", err));
}

export const aiController = {
  /**
   * Streams an AI reply for a conversation over Server-Sent Events.
   * Handles three flows in one endpoint, matching the API design:
   *  - a plain new message (`content`)
   *  - regenerating the last assistant reply (`regenerate: true`)
   *  - editing an earlier user message and re-running from there (`editMessageId`)
   */
  chat: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const conversationId = req.params.id;
    const { content, regenerate, editMessageId } = req.body as ChatRequestInput;

    await conversationService.getOwned(conversationId, userId);

    let newUserMessageContent: string | null = null;

    if (editMessageId) {
      if (!content) {
        throw ApiError.badRequest("New content is required when editing a message.");
      }
      const original = await messageRepository.findById(editMessageId);
      if (!original || original.conversationId !== conversationId || original.role !== "user") {
        throw ApiError.badRequest("That message can't be edited.");
      }
      await messageRepository.update(editMessageId, content);
      await messageRepository.deleteAfter(conversationId, original.createdAt);
    } else if (regenerate) {
      await messageRepository.deleteLastAssistantMessage(conversationId);
    } else {
      if (!content) {
        throw ApiError.badRequest("Message content is required.");
      }
      await messageRepository.create(conversationId, "user", content);
      newUserMessageContent = content;
    }

    const history = await messageRepository.listByConversation(conversationId);
    const userMessageCount = history.filter((m) => m.role === "user").length;
    const isFirstUserMessage = Boolean(newUserMessageContent) && userMessageCount === 1;
    const contextMessages = contextService.buildContext(history);

    // --- Begin SSE stream ---
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const controller = new AbortController();
    let clientClosed = false;
    req.on("close", () => {
      clientClosed = true;
      controller.abort();
    });

    let assistantContent = "";

    try {
      for await (const chunk of aiService.streamChat(contextMessages, controller.signal)) {
        assistantContent += chunk.delta;
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ delta: chunk.delta })}\n\n`);
        }
      }
    } catch (err) {
      // An intentional "Stop generating" click also lands here (AbortError) -
      // that's expected, not a failure, so we fall through and save what we have.
      if (!clientClosed) {
        logger.error("Streaming error", err);
        if (!res.writableEnded) {
          res.write(
            `event: error\ndata: ${JSON.stringify({
              message: "The AI response was interrupted. Please try again.",
            })}\n\n`
          );
        }
      }
    }

    // Persist whatever we streamed, even if it was cut short - never lose partial work.
    let savedMessageId: string | null = null;
    if (assistantContent.trim().length > 0) {
      const saved = await messageRepository.create(conversationId, "assistant", assistantContent, {
        model: env.aiModel,
      });
      savedMessageId = saved.id;
      await conversationRepository.touch(conversationId);
    }

    if (isFirstUserMessage && newUserMessageContent) {
      generateTitleInBackground(conversationId, newUserMessageContent);
    }

    if (!res.writableEnded) {
      res.write(`event: done\ndata: ${JSON.stringify({ messageId: savedMessageId })}\n\n`);
      res.end();
    }
  }),
};

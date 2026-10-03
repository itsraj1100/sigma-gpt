import { Request, Response } from "express";
import { conversationService } from "../services/conversationService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

export const conversationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const conversations = await conversationService.list(req.user!.id);
    sendSuccess(res, { conversations });
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query as { q: string };
    const conversations = await conversationService.search(req.user!.id, q);
    sendSuccess(res, { conversations });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const conversation = await conversationService.create(
      req.user!.id,
      req.body.title
    );
    sendSuccess(res, { conversation }, 201);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const conversation = await conversationService.getOwned(
      req.params.id,
      req.user!.id
    );
    sendSuccess(res, { conversation });
  }),

  rename: asyncHandler(async (req: Request, res: Response) => {
    const conversation = await conversationService.rename(
      req.params.id,
      req.user!.id,
      req.body.title
    );
    sendSuccess(res, { conversation });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await conversationService.remove(req.params.id, req.user!.id);
    sendSuccess(res, { message: "Conversation deleted." });
  }),
};

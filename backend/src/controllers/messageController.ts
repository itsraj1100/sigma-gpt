import { Request, Response } from "express";
import { messageService } from "../services/messageService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

export const messageController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const messages = await messageService.list(req.params.id, req.user!.id);
    sendSuccess(res, { messages });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.create(
      req.params.id,
      req.user!.id,
      req.body.role,
      req.body.content
    );
    sendSuccess(res, { message }, 201);
  }),
};

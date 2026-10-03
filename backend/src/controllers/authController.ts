import { Request, Response } from "express";
import { env } from "../config/env";
import { authService } from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { parseDurationMs } from "../utils/duration";
import { ApiError } from "../utils/ApiError";

function setAuthCookie(res: Response, token: string) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: parseDurationMs(env.jwtExpiresIn),
    path: "/",
  });
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { token, user } = await authService.register(req.body);
    setAuthCookie(res, token);
    sendSuccess(res, { user }, 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { token, user } = await authService.login(req.body);
    setAuthCookie(res, token);
    sendSuccess(res, { user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(env.cookieName, { path: "/" });
    sendSuccess(res, { message: "Logged out." });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    sendSuccess(res, { user: req.user });
  }),
};

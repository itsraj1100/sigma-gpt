import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { JwtPayload } from "../types";

/**
 * Verifies the JWT stored in the httpOnly auth cookie and attaches the
 * corresponding user (without the password hash) to req.user.
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[env.cookieName];

    if (!token) {
      throw ApiError.unauthorized("You must be logged in to do that.");
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw ApiError.unauthorized("Your session has expired. Please log in again.");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw ApiError.unauthorized("Your session is no longer valid.");
    }

    req.user = user;
    next();
  }
);

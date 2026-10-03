import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/** Catches routes that don't match anything and turns them into a 404 ApiError. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error handler. Every thrown error in the app ends up
 * here and is turned into the standard { success: false, error } shape.
 * Never leaks stack traces or internal details in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (res.headersSent) {
    // Streaming responses may already have sent partial SSE data.
    return res.end();
  }

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, err.stack);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Prisma "record not found" style errors, unexpected exceptions, etc.
  logger.error("Unhandled error on", req.method, req.originalUrl, err);

  return res.status(500).json({
    success: false,
    error: {
      message: "Something went wrong. Please try again.",
      ...(env.isProduction ? {} : { details: String(err) }),
    },
  });
}

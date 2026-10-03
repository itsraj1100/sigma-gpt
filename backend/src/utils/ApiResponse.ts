import { Response } from "express";

/** Send a consistent `{ success: true, data }` JSON payload. */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

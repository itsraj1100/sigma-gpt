import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validates req.body against a Zod schema, replacing it with the parsed
 * (and type-coerced) result. On failure, responds with a 400 that lists
 * every field error so the frontend can surface them.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      throw ApiError.badRequest("Validation failed", details);
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      throw ApiError.badRequest("Validation failed", details);
    }
    req.query = result.data as typeof req.query;
    next();
  };
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { apiLimiter } from "./middleware/rateLimitMiddleware";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(apiLimiter);

  app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

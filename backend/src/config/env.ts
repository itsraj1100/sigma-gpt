import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim()),

  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieName: process.env.COOKIE_NAME ?? "cc_token",

  aiApiKey: process.env.AI_API_KEY ?? "",
  aiBaseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
  aiModel: process.env.AI_MODEL ?? "gpt-4o-mini",
  aiTitleModel: process.env.AI_TITLE_MODEL ?? process.env.AI_MODEL ?? "gpt-4o-mini",

  aiMaxHistoryMessages: parseInt(process.env.AI_MAX_HISTORY_MESSAGES ?? "20", 10),
  aiMaxContextChars: parseInt(process.env.AI_MAX_CONTEXT_CHARS ?? "24000", 10),
  aiSystemPrompt:
    process.env.AI_SYSTEM_PROMPT ?? "You are a helpful, concise AI assistant.",

  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH ?? "8000", 10),

  isProduction: process.env.NODE_ENV === "production",
};

import rateLimit from "express-rate-limit";

/** Generous default limiter for most API traffic. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests. Please slow down and try again." },
  },
});

/** Stricter limiter for auth endpoints to slow down brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many attempts. Please try again later." },
  },
});

/** Chat/streaming is the most expensive route, so it gets its own budget. */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "You're sending messages too quickly. Please slow down." },
  },
});

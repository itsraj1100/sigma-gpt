import { AuthUser } from "./index";

// Augment Express's Request type so `req.user` is available and typed
// after the auth middleware has run.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};

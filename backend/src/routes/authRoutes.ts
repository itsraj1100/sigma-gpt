import { Router } from "express";
import { authController } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimitMiddleware";
import { validateBody } from "../middleware/validationMiddleware";
import { registerSchema, loginSchema } from "../validators/authValidators";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;

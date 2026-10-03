import { Router } from "express";
import authRoutes from "./authRoutes";
import conversationRoutes from "./conversationRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/conversations", conversationRoutes);

export default router;

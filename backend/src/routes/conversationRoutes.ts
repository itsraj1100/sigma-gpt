import { Router } from "express";
import { conversationController } from "../controllers/conversationController";
import { messageController } from "../controllers/messageController";
import { aiController } from "../controllers/aiController";
import { requireAuth } from "../middleware/authMiddleware";
import { chatLimiter } from "../middleware/rateLimitMiddleware";
import { validateBody, validateQuery } from "../middleware/validationMiddleware";
import {
  createConversationSchema,
  updateConversationSchema,
  searchConversationsSchema,
} from "../validators/conversationValidators";
import { createMessageSchema, chatRequestSchema } from "../validators/messageValidators";

const router = Router();

router.use(requireAuth);

// IMPORTANT: /search must be registered before the /:id routes, or
// Express will try to treat "search" as a conversation id.
router.get("/search", validateQuery(searchConversationsSchema), conversationController.search);

router.get("/", conversationController.list);
router.post("/", validateBody(createConversationSchema), conversationController.create);
router.get("/:id", conversationController.getById);
router.patch("/:id", validateBody(updateConversationSchema), conversationController.rename);
router.delete("/:id", conversationController.remove);

router.get("/:id/messages", messageController.list);
router.post("/:id/messages", validateBody(createMessageSchema), messageController.create);

router.post("/:id/chat", chatLimiter, validateBody(chatRequestSchema), aiController.chat);

export default router;

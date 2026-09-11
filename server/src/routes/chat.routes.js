import { Router } from "express";
import * as chat from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/conversations", requireAuth, asyncHandler(chat.listConversations));
router.post(
  "/conversations",
  requireAuth,
  asyncHandler(chat.startConversation),
);
router.get(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(chat.getMessages),
);
router.post(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(chat.sendMessage),
);
router.post(
  "/conversations/:id/read",
  requireAuth,
  asyncHandler(chat.markRead),
);
router.get("/notifications", requireAuth, asyncHandler(chat.listNotifications));
router.post(
  "/notifications/read-all",
  requireAuth,
  asyncHandler(chat.markAllNotificationsRead),
);

export default router;

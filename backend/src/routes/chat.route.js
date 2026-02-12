import express from "express";

import {
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
    sendMessage,
    getUnreadCount,
    markConversationAsRead,
} from "../controllers/chat.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { startConversationSchema, sendMessageSchema } from "../lib/zod.js";

const router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";

import { upload } from "../middleware/multer.middleware.js";

router.get("/", protectRoute, getConversations);
router.get("/unread-count", protectRoute, getUnreadCount);
router.put("/:conversationId/read", protectRoute, markConversationAsRead);
router.get("/:conversationId/messages", protectRoute, getMessages);
router.post("/", protectRoute, validate(startConversationSchema), startConversation);
router.post("/message", protectRoute, upload.array("files", 5), validate(sendMessageSchema), sendMessage);

export default router;

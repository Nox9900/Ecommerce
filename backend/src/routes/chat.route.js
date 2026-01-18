import express from "express";

import {
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";

router.get("/", protectRoute, getConversations);
router.get("/:conversationId/messages", protectRoute, getMessages);
router.post("/", protectRoute, startConversation);
router.post("/message", protectRoute, sendMessage);

export default router;

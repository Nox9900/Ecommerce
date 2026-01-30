import express from "express";

import {
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";

import { upload } from "../middleware/multer.middleware.js";

router.get("/", protectRoute, getConversations);
router.get("/:conversationId/messages", protectRoute, getMessages);
router.post("/", protectRoute, startConversation);
router.post("/message", protectRoute, upload.array("files", 5), sendMessage);

export default router;

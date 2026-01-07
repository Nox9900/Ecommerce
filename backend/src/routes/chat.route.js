import express from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import {
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Middleware to attach auth to request (using Clerk)
// Adjust based on your actual Clerk middleware setup in server.js.
// Assuming ClerkExpressRequireAuth or similar is used.
// If your project uses a custom middleware for user resolution, use that.
// Looking at package.json, it has @clerk/express.

import { requireAuth } from "@clerk/express";

router.get("/", requireAuth(), getConversations);
router.get("/:conversationId/messages", requireAuth(), getMessages);
router.post("/", requireAuth(), startConversation);
router.post("/message", requireAuth(), sendMessage);

export default router;

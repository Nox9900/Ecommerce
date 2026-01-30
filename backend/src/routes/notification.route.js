import express from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js"; // Assuming auth middleware exists
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.get("/unread", getUnreadCount);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

// Allow admins/vendors to create notifications manually
// You might want to add a role check here (adminRoute or vendor check)
router.post("/", sendNotification);

export default router;

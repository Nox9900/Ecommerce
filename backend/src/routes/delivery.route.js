import express from "express";
import { updateTrackingInfo, getDeliveryInfo } from "../controllers/delivery.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Update tracking info (admin only)
router.put("/:orderId/tracking", protectRoute, adminOnly, updateTrackingInfo);

// Get delivery info (authenticated users - will check ownership in controller)
router.get("/:orderId", protectRoute, getDeliveryInfo);

export default router;

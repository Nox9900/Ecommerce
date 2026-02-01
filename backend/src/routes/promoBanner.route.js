import express from "express";
import {
    getActivePromoBanners,
    getAllPromoBanners,
    createPromoBanner,
    updatePromoBanner,
    deletePromoBanner
} from "../controllers/promoBanner.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route
router.get("/", getActivePromoBanners);

// Admin routes
router.get("/all", protectRoute, adminOnly, getAllPromoBanners);
router.post("/", protectRoute, adminOnly, createPromoBanner);
router.put("/:id", protectRoute, adminOnly, updatePromoBanner);
router.delete("/:id", protectRoute, adminOnly, deletePromoBanner);

export default router;

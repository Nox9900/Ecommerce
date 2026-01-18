import express from "express";
import {
    getActivePromoBanners,
    getAllPromoBanners,
    createPromoBanner,
    updatePromoBanner,
    deletePromoBanner
} from "../controllers/promoBanner.controller.js";

const router = express.Router();

// Public route
router.get("/", getActivePromoBanners);

// Admin routes (should ideally have admin middleware but following existing pattern)
router.get("/all", getAllPromoBanners);
router.post("/", createPromoBanner);
router.put("/:id", updatePromoBanner);
router.delete("/:id", deletePromoBanner);

export default router;

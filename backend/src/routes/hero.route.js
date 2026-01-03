import { Router } from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import {
    getActiveHero,
    getAllHeroes,
    createHero,
    updateHero,
    deleteHero,
} from "../controllers/hero.controller.js";

const router = Router();

// Public route
router.get("/", getActiveHero);

// Admin routes
router.get("/all", protectRoute, adminOnly, getAllHeroes);
router.post("/", protectRoute, adminOnly, createHero);
router.put("/:id", protectRoute, adminOnly, updateHero);
router.delete("/:id", protectRoute, adminOnly, deleteHero);

export default router;

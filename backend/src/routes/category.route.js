import { Router } from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import {
    getActiveCategories,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCategorySchema, updateCategorySchema } from "../lib/zod.js";

const router = Router();

// Public route
router.get("/", getActiveCategories);

// Admin/Vendor routes
router.get("/all", protectRoute, adminOnly, getAllCategories);
router.post("/", protectRoute, adminOnly, validate(createCategorySchema), createCategory);
router.put("/:id", protectRoute, adminOnly, validate(updateCategorySchema), updateCategory);
router.delete("/:id", protectRoute, adminOnly, deleteCategory);

export default router;

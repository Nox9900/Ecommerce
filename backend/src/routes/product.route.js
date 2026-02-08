import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchProducts, getProductById } from "../controllers/product.controller.js";

const router = Router();

router.get("/", searchProducts);
router.get("/:id", getProductById);

export default router;

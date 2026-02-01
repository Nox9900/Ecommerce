import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addToCartSchema, updateCartItemSchema } from "../lib/zod.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(protectRoute);

router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.put("/:productId", validate(updateCartItemSchema), updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;

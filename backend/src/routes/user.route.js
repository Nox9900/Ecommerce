import { Router } from "express";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  getAddresses,
  getWishlist,
  removeFromWishlist,
  updateAddress,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addressSchema, wishlistSchema } from "../lib/zod.js";

const router = Router();

router.use(protectRoute);

// address routes
router.post("/addresses", validate(addressSchema), addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", validate(addressSchema), updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// wishlist routes
router.post("/wishlist", validate(wishlistSchema), addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);
router.get("/wishlist", getWishlist);

export default router;

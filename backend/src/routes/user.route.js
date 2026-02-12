import { Router } from "express";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  getAddresses,
  getPublicWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlistPrivacy,
  updateAddress,
  savePushToken,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addressSchema, wishlistSchema, updateAddressSchema } from "../lib/zod.js";

const router = Router();

router.use(protectRoute);

// address routes
router.post("/addresses", validate(addressSchema), addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", validate(updateAddressSchema), updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// wishlist routes
router.post("/wishlist", validate(wishlistSchema), addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);
router.get("/wishlist", getWishlist);
router.put("/wishlist/share", toggleWishlistPrivacy);
router.get("/wishlist/share/:token", getPublicWishlist);

// push notification token route
router.post("/push-token", savePushToken);

export default router;

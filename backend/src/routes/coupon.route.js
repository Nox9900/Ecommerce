import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getCouponStats,
} from "../controllers/coupon.controller.js";

const router = Router();

// Public route for validation (e.g. at cart) - still needs auth as user is logged in
router.post("/validate", protectRoute, validateCoupon);

// Protected routes (Admin/Vendor)
router.use(protectRoute);

// In a real app, we'd add restrictTo('admin', 'vendor') middleware here
// For now, we rely on protectRoute and logic inside controllers to check ownership/role

router.route("/")
    .get(getCoupons)
    .post(createCoupon);

router.route("/:id")
    .get(getCouponById)
    .put(updateCoupon)
    .delete(deleteCoupon);

router.get("/:id/stats", getCouponStats);

export default router;

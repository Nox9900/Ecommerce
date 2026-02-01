import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createReview, deleteReview, getProductReviews } from "../controllers/review.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReviewSchema } from "../lib/zod.js";

const router = Router();
router.get("/product/:productId", getProductReviews);
router.post("/", protectRoute, validate(createReviewSchema), createReview);
// we did not implement this function in the mobile app - in the frontend
// but jic if you'd like to see the backend code here it is - i provided
router.delete("/:reviewId", protectRoute, deleteReview);
export default router;

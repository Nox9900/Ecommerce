import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";
import {
  parsePaginationParams,
  selectFields,
  buildReviewStatsAggregate,
} from "../utils/queryOptimization.js";

export const createReview = catchAsync(async (req, res, next) => {
  const { productId, orderId, rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  const user = req.user;

  // verify order exists and is delivered
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.clerkId !== user.clerkId) {
    return next(new AppError("Not authorized to review this order", 403));
  }

  if (order.status !== "delivered") {
    return next(new AppError("Can only review delivered orders", 400));
  }

  // verify product is in the order
  const productInOrder = order.orderItems.find((item) => item.product.toString() === productId.toString());
  if (!productInOrder) {
    return next(new AppError("Product not found in this order", 400));
  }

  // atomic update or create
  const review = await Review.findOneAndUpdate(
    { productId, userId: user._id },
    { rating, comment: req.body.comment || "", orderId, productId, userId: user._id },
    { new: true, upsert: true, runValidators: true }
  );

  // Use aggregation to calculate rating stats instead of loading all reviews
  const pipeline = buildReviewStatsAggregate(productId);
  const stats = await Review.aggregate(pipeline);

  const reviewStats = stats.length > 0 ? stats[0] : { averageRating: 0, totalReviews: 0 };
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      averageRating: reviewStats.averageRating,
      totalReviews: reviewStats.totalReviews,
    },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    await Review.findByIdAndDelete(review._id);
    return next(new AppError("Product not found", 404));
  }

  await review.populate("userId", "name imageUrl");
  res.status(201).json({ message: "Review submitted successfully", review });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;

  const user = req.user;

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  if (review.userId.toString() !== user._id.toString()) {
    return next(new AppError("Not authorized to delete this review", 403));
  }

  const productId = review.productId;
  await Review.findByIdAndDelete(reviewId);

  // Use aggregation to calculate rating stats
  const pipeline = buildReviewStatsAggregate(productId);
  const stats = await Review.aggregate(pipeline);

  const reviewStats = stats.length > 0 ? stats[0] : { averageRating: 0, totalReviews: 0 };
  await Product.findByIdAndUpdate(productId, {
    averageRating: reviewStats.averageRating,
    totalReviews: reviewStats.totalReviews,
  });

  res.status(200).json({ message: "Review deleted successfully" });
});

export const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { page, limit, skip } = parsePaginationParams(req.query);

  const [reviews, totalCount] = await Promise.all([
    Review.find({ productId })
      .populate(selectFields("userId", "name imageUrl _id"))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ productId }),
  ]);

  res.status(200).json({
    reviews,
    total: totalCount,
    page: parseInt(page),
    pages: Math.ceil(totalCount / limit),
  });
});

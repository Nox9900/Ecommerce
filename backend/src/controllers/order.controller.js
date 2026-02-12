import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { Coupon } from "../models/coupon.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";
import {
  parsePaginationParams,
  buildUserOrdersPipeline,
} from "../utils/queryOptimization.js";

export const createOrder = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { orderItems, shippingAddress, paymentResult, totalPrice, couponCode } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError("No order items", 400));
  }

  let calculatedSubtotal = 0;

  // validate products and stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      return next(new AppError(`Product ${item.name} not found`, 404));
    }

    let price = product.price;

    if (item.variantId) {
      const variant = product.variants.find((v) => v._id.toString() === item.variantId);
      if (!variant) {
        return next(new AppError(`Variant not found for ${product.name}`, 404));
      }
      if (variant.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name} (${variant.name})`, 400));
      }
      price = variant.price;
    } else {
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }
    }

    calculatedSubtotal += price * item.quantity;
  }

  // Coupon Logic
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

    if (!coupon) {
      return next(new AppError("Invalid coupon code", 400));
    }

    // Validate coupon
    if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) {
      return next(new AppError("Coupon is not active", 400));
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError("Coupon usage limit reached", 400));
    }
    const userUsage = coupon.usedBy.find(u => u.userId.toString() === user._id.toString());
    if (coupon.usageLimitPerUser && userUsage && userUsage.count >= coupon.usageLimitPerUser) {
      return next(new AppError("You have already used this coupon", 400));
    }
    if (coupon.minOrderValue && calculatedSubtotal < coupon.minOrderValue) {
      return next(new AppError(`Minimum order value of $${coupon.minOrderValue} required`, 400));
    }

    // Calculate discount
    if (coupon.type === "percentage") {
      discountAmount = (calculatedSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.value;
    }

    if (discountAmount > calculatedSubtotal) discountAmount = calculatedSubtotal;

    // Increment usage
    coupon.usedCount += 1;
    if (userUsage) {
      userUsage.count += 1;
    } else {
      coupon.usedBy.push({ userId: user._id, count: 1 });
    }
    await coupon.save();
  }

  const order = await Order.create({
    user: user._id,
    clerkId: user.clerkId,
    orderItems,
    shippingAddress,
    paymentResult,
    totalPrice,
    couponCode,
    discountAmount,
    subtotalBeforeDiscount: calculatedSubtotal
  });

  // update product stock
  for (const item of orderItems) {
    if (item.variantId) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.find((v) => v._id.toString() === item.variantId);
      if (variant) {
        variant.stock -= item.quantity;
        product.soldCount += item.quantity;
        await product.save();
      }
    } else {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }
  }

  // Create notification for the user
  // (We keep this in a separate try/catch if we don't want notification failure to fail the request)
  // OR we can just await it since we are in catchAsync, but notifications are secondary.
  // Best practice: if notification fails, order success should still be returned.
  // So we keep the try/catch around the notification block specifically.
  try {
    const { Notification } = await import("../models/notification.model.js");
    const notification = await Notification.create({
      recipient: user._id,
      type: "order",
      title: "Order Placed Successfully",
      body: `Your order #${order._id.toString().slice(-6)} has been placed.`,
      data: { orderId: order._id },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(user._id.toString()).emit("notification:new", notification);
    }
  } catch (err) {
    console.error("Failed to create notification", err);
  }

  res.status(201).json({ message: "Order created successfully", order });
});

export const getUserOrders = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  // Use aggregation pipeline to fetch orders with products and review status in one query
  const pipeline = buildUserOrdersPipeline(req.user.clerkId, skip, limit);

  const [orders, totalCount] = await Promise.all([
    Order.aggregate(pipeline),
    Order.countDocuments({ clerkId: req.user.clerkId }),
  ]);

  res.status(200).json({
    orders,
    total: totalCount,
    page: parseInt(page),
    pages: Math.ceil(totalCount / limit),
  });
});

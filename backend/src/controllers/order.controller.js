import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const createOrder = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError("No order items", 400));
  }

  // validate products and stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      return next(new AppError(`Product ${item.name} not found`, 404));
    }

    if (item.variantId) {
      const variant = product.variants.find((v) => v._id.toString() === item.variantId);
      if (!variant) {
        return next(new AppError(`Variant not found for ${product.name}`, 404));
      }
      if (variant.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name} (${variant.name})`, 400));
      }
    } else {
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }
    }
  }

  const order = await Order.create({
    user: user._id,
    clerkId: user.clerkId,
    orderItems,
    shippingAddress,
    paymentResult,
    totalPrice,
  });

  // update product stock
  for (const item of orderItems) {
    if (item.variantId) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.find((v) => v._id.toString() === item.variantId);
      if (variant) {
        variant.stock -= item.quantity;
        await product.save();
      }
    } else {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
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
  const orders = await Order.find({ clerkId: req.user.clerkId }).populate("orderItems.product").sort({ createdAt: -1 });

  // check if each order has been reviewed

  const orderIds = orders.map((order) => order._id);
  const reviews = await Review.find({ orderId: { $in: orderIds } });
  const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

  const ordersWithReviewStatus = await Promise.all(
    orders.map(async (order) => {
      return {
        ...order.toObject(),
        hasReviewed: reviewedOrderIds.has(order._id.toString()),
      };
    })
  );

  res.status(200).json({ orders: ordersWithReviewStatus });
});

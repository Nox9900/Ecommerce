import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items" });
    }

    // validate products and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }

      if (item.variantId) {
        const variant = product.variants.find((v) => v._id.toString() === item.variantId);
        if (!variant) {
          return res.status(404).json({ error: `Variant not found for ${product.name}` });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name} (${variant.name})` });
        }
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
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
    await import("../models/notification.model.js").then(async ({ Notification }) => {
      try {
        const notification = await Notification.create({
          recipient: user._id,
          type: "order",
          title: "Order Placed Successfully",
          body: `Your order #${order._id.toString().slice(-6)} has been placed.`,
          data: { orderId: order._id }
        });

        const io = req.app.get("io");
        if (io) {
          io.to(user._id.toString()).emit("notification:new", notification);
          // Optionally notify vendors here if needed (complex for multi-vendor orders)
        }
      } catch (err) {
        console.error("Failed to create notification", err);
      }
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

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
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

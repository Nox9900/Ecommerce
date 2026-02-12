import { Order } from "../models/order.model.js";
import { Notification } from "../models/notification.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";
import { sendTrackingNotification } from "../services/pushNotification.service.js";

/**
 * Update tracking information for an order
 * POST /api/delivery/:orderId/tracking
 */
export const updateTrackingInfo = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    if (!trackingNumber || !carrier) {
        return next(new AppError("Tracking number and carrier are required", 400));
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    // Update tracking information
    order.trackingNumber = trackingNumber;
    order.carrier = carrier;
    if (estimatedDelivery) {
        order.estimatedDelivery = new Date(estimatedDelivery);
    }

    await order.save();

    // Create notification
    try {
        const orderShortId = order._id.toString().slice(-6);
        const notification = await Notification.create({
            recipient: order.user._id,
            type: "delivery",
            title: "Tracking Available",
            body: `Your order #${orderShortId} can now be tracked. Carrier: ${carrier}`,
            data: {
                orderId: order._id,
                trackingNumber,
            },
        });

        // Send socket notification
        const io = req.app.get("io");
        if (io) {
            io.to(order.user._id.toString()).emit("notification:new", notification);
        }

        // Send push notification
        await sendTrackingNotification(order.user, order._id, trackingNumber, carrier);
    } catch (err) {
        console.error("Failed to send tracking notification:", err);
    }

    res.status(200).json({
        message: "Tracking information updated successfully",
        order,
    });
});

/**
 * Get delivery information for an order
 * GET /api/delivery/:orderId
 */
export const getDeliveryInfo = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    // Check if user owns this order or is admin
    if (order.clerkId !== user.clerkId && user.role !== "admin") {
        return next(new AppError("You are not authorized to view this order", 403));
    }

    const deliveryInfo = {
        orderId: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        shippingAddress: order.shippingAddress,
    };

    res.status(200).json(deliveryInfo);
});

import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Order } from "../models/order.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

// Admin Bulk Delete Products
export const bulkDeleteProducts = catchAsync(async (req, res, next) => {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    // Fetch products to delete their images from Cloudinary
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
        return next(new AppError("No products found", 404));
    }

    // Delete images from Cloudinary
    const deleteImagePromises = products.flatMap((product) => {
        if (product.images && product.images.length > 0) {
            return product.images.map((imageUrl) => {
                try {
                    const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
                    if (publicId) return cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error parsing image URL:", err);
                    return null;
                }
            });
        }
        return [];
    });

    await Promise.allSettled(deleteImagePromises.filter(Boolean));

    // Delete products from database
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.status(200).json({
        message: `Successfully deleted ${result.deletedCount} product(s)`,
        deletedCount: result.deletedCount,
    });
});

// Admin Bulk Update Product Stock
export const bulkUpdateProductStock = catchAsync(async (req, res, next) => {
    const { productIds, stock } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    if (stock === undefined || stock === null) {
        return next(new AppError("Stock value is required", 400));
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
        return next(new AppError("Stock must be a non-negative number", 400));
    }

    // Update products
    const result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { stock: stockValue } }
    );

    res.status(200).json({
        message: `Successfully updated stock for ${result.modifiedCount} product(s)`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
    });
});

// Vendor Bulk Delete Products (only their own)
export const vendorBulkDeleteProducts = catchAsync(async (req, res, next) => {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    // Get vendor profile
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
        return next(new AppError("Vendor profile not found", 404));
    }

    // Fetch products that belong to this vendor
    const products = await Product.find({
        _id: { $in: productIds },
        vendor: vendor._id,
    });

    if (products.length === 0) {
        return next(new AppError("No products found or you don't have permission to delete these products", 404));
    }

    // Delete images from Cloudinary
    const deleteImagePromises = products.flatMap((product) => {
        if (product.images && product.images.length > 0) {
            return product.images.map((imageUrl) => {
                try {
                    const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
                    if (publicId) return cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error parsing image URL:", err);
                    return null;
                }
            });
        }
        return [];
    });

    await Promise.allSettled(deleteImagePromises.filter(Boolean));

    // Delete products from database (only vendor's products)
    const result = await Product.deleteMany({
        _id: { $in: productIds },
        vendor: vendor._id,
    });

    res.status(200).json({
        message: `Successfully deleted ${result.deletedCount} product(s)`,
        deletedCount: result.deletedCount,
    });
});

// Vendor Bulk Update Product Stock (only their own)
export const vendorBulkUpdateProductStock = catchAsync(async (req, res, next) => {
    const { productIds, stock } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    if (stock === undefined || stock === null) {
        return next(new AppError("Stock value is required", 400));
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
        return next(new AppError("Stock must be a non-negative number", 400));
    }

    // Get vendor profile
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
        return next(new AppError("Vendor profile not found", 404));
    }

    // Update products (only vendor's products)
    const result = await Product.updateMany(
        { _id: { $in: productIds }, vendor: vendor._id },
        { $set: { stock: stockValue } }
    );

    res.status(200).json({
        message: `Successfully updated stock for ${result.modifiedCount} product(s)`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
    });
});

// Admin Bulk Update Order Status
export const bulkUpdateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return next(new AppError("Order IDs array is required", 400));
    }

    if (!["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
        return next(new AppError("Invalid status", 400));
    }

    const updateData = { status };
    if (status === "shipped") updateData.shippedAt = new Date();
    if (status === "delivered") updateData.deliveredAt = new Date();

    // Update orders
    const result = await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: updateData }
    );

    // Send notifications (fire and forget to avoid blocking response)
    // We fetch the updated orders to get user details for notifications
    (async () => {
        try {
            const orders = await Order.find({ _id: { $in: orderIds } }).populate("user");
            const { Notification } = await import("../models/notification.model.js");
            const { sendOrderStatusNotification } = await import("../services/pushNotification.service.js");
            const io = req.app.get("io");

            for (const order of orders) {
                if (!order.user) continue;

                const orderShortId = order._id.toString().slice(-6);
                const notificationMessages = {
                    pending: { title: "Order Placed", body: `Your order #${orderShortId} has been placed successfully!` },
                    processing: { title: "Order Processing", body: `Your order #${orderShortId} is being processed.` },
                    shipped: { title: "Order Shipped", body: `Great news! Your order #${orderShortId} has been shipped!` },
                    delivered: { title: "Order Delivered", body: `Your order #${orderShortId} has been delivered. Enjoy!` },
                    cancelled: { title: "Order Cancelled", body: `Your order #${orderShortId} has been cancelled.` },
                    refunded: { title: "Order Refunded", body: `Your order #${orderShortId} has been refunded.` },
                };

                const notifMsg = notificationMessages[status] || {
                    title: "Order Update",
                    body: `Your order #${orderShortId} status has been updated to ${status}.`,
                };

                // Create in-app notification
                const notification = await Notification.create({
                    recipient: order.user._id,
                    type: status === "shipped" || status === "delivered" ? "delivery" : "order",
                    title: notifMsg.title,
                    body: notifMsg.body,
                    data: { orderId: order._id },
                });

                // Send socket notification
                if (io) {
                    io.to(order.user._id.toString()).emit("notification:new", notification);
                }

                // Send push notification
                await sendOrderStatusNotification(order.user, order._id, status);
            }
        } catch (error) {
            console.error("Error sending bulk order notifications:", error);
        }
    })();

    res.status(200).json({
        message: `Successfully updated status for ${result.modifiedCount} order(s)`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
    });
});

// Admin Bulk Delete Orders
export const bulkDeleteOrders = catchAsync(async (req, res, next) => {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return next(new AppError("Order IDs array is required", 400));
    }

    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    res.status(200).json({
        message: `Successfully deleted ${result.deletedCount} order(s)`,
        deletedCount: result.deletedCount,
    });
});

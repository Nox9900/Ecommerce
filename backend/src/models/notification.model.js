import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["order", "message", "promotion", "system", "wishlist", "delivery"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        data: {
            orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
            conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            trackingNumber: String,
            // Any other related data
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 }); // User notification feed
notificationSchema.index({ read: 1 }); // Filter unread notifications

export const Notification = mongoose.model("Notification", notificationSchema);

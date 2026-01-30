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
            enum: ["order", "message", "promotion", "system"],
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
            // Any other related data
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);

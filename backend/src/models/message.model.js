import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: false,
        },
        attachments: [
            {
                type: {
                    type: String,
                    enum: ["image", "file", "audio", "video"],
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
                name: {
                    type: String,
                },
            },
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: 1 }); // Chat history (oldest first usually, or newest)

export const Message = mongoose.model("Message", messageSchema);

import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        bankDetails: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            swiftCode: String,
        },
        adminNote: {
            type: String,
        },
        processedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Indexes
withdrawalSchema.index({ vendor: 1, createdAt: -1 }); // Vendor withdrawal history
withdrawalSchema.index({ status: 1 }); // Admin processing queue

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

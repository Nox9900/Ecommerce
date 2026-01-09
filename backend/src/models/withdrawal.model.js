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

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

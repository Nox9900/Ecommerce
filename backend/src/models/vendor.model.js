import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        shopName: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        commissionRate: {
            type: Number,
            default: 0.1, // 10% default
        },
        earnings: {
            type: Number,
            default: 0,
        },
        logoUrl: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);

import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        globalCommissionRate: {
            type: Number,
            default: 0.1, // 10%
        },
        platformName: {
            type: String,
            default: "Multi-Vendor Shop",
        },
        contactEmail: {
            type: String,
            default: "admin@example.com",
        },
    },
    { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);

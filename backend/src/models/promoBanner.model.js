import mongoose from "mongoose";

const promoBannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            default: "Official Subsidy",
        },
        imageUrl: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["subsidy", "fresh"],
            default: "subsidy",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Indexes
promoBannerSchema.index({ isActive: 1, displayOrder: 1 }); // Sorted list of active banners

export const PromoBanner = mongoose.model("PromoBanner", promoBannerSchema);

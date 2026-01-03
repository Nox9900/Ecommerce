import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            default: "New Collection",
        },
        imageUrl: {
            type: String,
            required: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Hero = mongoose.model("Hero", heroSchema);

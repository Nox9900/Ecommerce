import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        icon: {
            type: String,
            required: true, // Ionicons icon name
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        subcategories: [
            {
                name: {
                    type: String,
                    required: true,
                },
                icon: {
                    type: String,
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
        ],
    },
    { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);

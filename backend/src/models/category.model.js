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
        color: {
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
        subcategories: [
            {
                name: {
                    type: String,
                    required: true,
                },
                icon: {
                    type: String,
                },
                color: {
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
                translations: {
                    type: Map,
                    of: {
                        name: String,
                    },
                    default: {},
                },
            },
        ],
        translations: {
            type: Map,
            of: {
                name: String,
            },
            default: {},
        },
    },
    { timestamps: true }
);

// Indexes
categorySchema.index({ isActive: 1, displayOrder: 1 }); // Sorted list of active categories

export const Category = mongoose.model("Category", categorySchema);

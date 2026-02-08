import mongoose from "mongoose";

const userBehaviorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        viewedProducts: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                viewedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        searchQueries: [
            {
                query: {
                    type: String,
                    required: true,
                },
                searchedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

// Indexes
userBehaviorSchema.index({ user: 1 });

export const UserBehavior = mongoose.model("UserBehavior", userBehaviorSchema);

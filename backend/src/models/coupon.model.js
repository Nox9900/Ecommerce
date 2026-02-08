import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderValue: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxDiscount: {
            type: Number, // Only relevant for percentage coupons
            min: 0,
        },
        usageLimit: {
            type: Number, // Total number of times this coupon can be used
            default: null, // null means unlimited
        },
        usageLimitPerUser: {
            type: Number, // How many times a single user can use this coupon
            default: 1,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usedBy: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                count: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor", // If null, it's a platform-wide coupon
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, // User ID of admin or vendor
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ vendor: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);

import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        logoUrl: {
            type: String,
            default: "",
        },
        bannerUrl: {
            type: String,
            default: "",
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Indexes
shopSchema.index({ vendor: 1 }); // Lookup shop by vendor
shopSchema.index({ owner: 1 }); // Lookup shop by owner
shopSchema.index({ createdAt: -1 }); // Newest shops lists

export const Shop = mongoose.model("Shop", shopSchema);

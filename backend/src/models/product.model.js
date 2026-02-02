import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    brand: {
      type: String,
    },
    isSubsidy: {
      type: Boolean,
      default: false,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    attributes: [
      {
        name: String,
        values: [String],
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    variants: [
      {
        name: String,
        options: {
          type: Map,
          of: String,
        },
        price: Number,
        stock: Number,
        sku: String,
        image: String,
      },
    ],
    translations: {
      type: Map,
      of: {
        name: String,
        description: String,
      },
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for high-traffic queries and sorting
productSchema.index({ shop: 1, createdAt: -1 });  // Shop product lists
productSchema.index({ vendor: 1, createdAt: -1 }); // Vendor dashboard
productSchema.index({ category: 1, createdAt: -1 }); // Category browsing
productSchema.index({ name: "text" }); // Text search
productSchema.index({ price: 1 }); // Filtering/Sorting
productSchema.index({ averageRating: -1 }); // Sorting by rating
productSchema.index({ soldCount: -1 }); // Sorting by popularity

export const Product = mongoose.model("Product", productSchema);

import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      unique: true,
      required: true,
    },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    addresses: [addressSchema],
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    vendorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isWishlistPublic: {
      type: Boolean,
      default: false,
    },
    wishlistToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    expoPushToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1, createdAt: -1 }); // Admin filtering

export const User = mongoose.model("User", userSchema);

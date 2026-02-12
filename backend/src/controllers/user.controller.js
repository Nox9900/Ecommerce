import { User } from "../models/user.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";
import crypto from "crypto";

export const addAddress = catchAsync(async (req, res, next) => {
  const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } =
    req.body;

  const user = req.user;

  if (!fullName || !streetAddress || !city || !state || !zipCode) {
    return next(new AppError("Missing required address fields", 400));
  }

  // if this is set as default, unset all other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    label,
    fullName,
    streetAddress,
    city,
    state,
    zipCode,
    phoneNumber,
    isDefault: isDefault || false,
  });

  await user.save();

  res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
});

export const getAddresses = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ addresses: user.addresses });
});

export const updateAddress = catchAsync(async (req, res, next) => {
  const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } =
    req.body;

  const { addressId } = req.params;

  const user = req.user;
  const address = user.addresses.id(addressId);
  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  // if this is set as default, unset all other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  address.label = label || address.label;
  address.fullName = fullName || address.fullName;
  address.streetAddress = streetAddress || address.streetAddress;
  address.city = city || address.city;
  address.state = state || address.state;
  address.zipCode = zipCode || address.zipCode;
  address.phoneNumber = phoneNumber || address.phoneNumber;
  address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

  await user.save();

  res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
});

export const deleteAddress = catchAsync(async (req, res, next) => {
  const { addressId } = req.params;
  const user = req.user;

  user.addresses.pull(addressId);
  await user.save();

  res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
});

export const addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const user = req.user;

  // check if product is already in the wishlist
  if (user.wishlist.includes(productId)) {
    return next(new AppError("Product already in wishlist", 400));
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
});

export const removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const user = req.user;

  // check if product is already in the wishlist
  if (!user.wishlist.includes(productId)) {
    return next(new AppError("Product not found in wishlist", 400));
  }

  user.wishlist.pull(productId);
  await user.save();

  res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
});


export const getWishlist = catchAsync(async (req, res, next) => {
  // we're using populate, bc wishlist is just an array of product ids
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({ wishlist: user.wishlist, isWishlistPublic: user.isWishlistPublic, wishlistToken: user.wishlistToken });
});

export const toggleWishlistPrivacy = catchAsync(async (req, res, next) => {
  const user = req.user;
  user.isWishlistPublic = !user.isWishlistPublic;

  if (user.isWishlistPublic && !user.wishlistToken) {
    user.wishlistToken = crypto.randomBytes(20).toString("hex");
  }

  await user.save();

  res.status(200).json({
    message: "Wishlist privacy updated",
    isWishlistPublic: user.isWishlistPublic,
    wishlistToken: user.wishlistToken,
  });
});


export const getPublicWishlist = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({ wishlistToken: token }).populate("wishlist");

  if (!user || !user.isWishlistPublic) {
    return next(new AppError("Wishlist not found or is private", 404));
  }

  res.status(200).json({ wishlist: user.wishlist, ownerName: user.name });
});

/**
 * Save/update user's Expo push token
 * POST /api/users/push-token
 */
export const savePushToken = catchAsync(async (req, res, next) => {
  const { expoPushToken } = req.body;
  const user = req.user;

  if (!expoPushToken) {
    return next(new AppError("Push token is required", 400));
  }

  // Basic validation for Expo push token format
  if (!expoPushToken.startsWith("ExponentPushToken[") && !expoPushToken.startsWith("ExpoPushToken[")) {
    return next(new AppError("Invalid Expo push token format", 400));
  }

  user.expoPushToken = expoPushToken;
  await user.save();

  res.status(200).json({
    message: "Push token saved successfully",
    expoPushToken: user.expoPushToken,
  });
});

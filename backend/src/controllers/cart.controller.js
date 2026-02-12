import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ clerkId: req.user.clerkId })
    .populate("items.product")
    .lean();

  if (!cart) {
    const user = req.user;
    cart = await Cart.create({
      user: user._id,
      clerkId: user.clerkId,
      items: [],
      coupon: null,
    });
  }

  // Calculate totals
  let subtotal = 0;
  const cartItems = cart.items.filter(item => item.product); // Filter out null products

  for (const item of cartItems) {
    const product = item.product;
    let price = product.price;

    if (item.variantId) {
      const variant = product.variants.find((v) => v._id.toString() === item.variantId);
      if (variant) {
        price = variant.price;
      }
    }
    subtotal += price * item.quantity;
  }

  let discountAmount = 0;
  let couponDetails = null;

  if (cart.coupon) {
    const coupon = await Coupon.findOne({ code: cart.coupon, isActive: true });

    // Validate coupon validity
    if (coupon) {
      const now = new Date();
      if (now >= coupon.validFrom && now <= coupon.validUntil &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
        (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)) {

        // Check per user limit
        const userUsage = coupon.usedBy.find(u => u.userId.toString() === req.user._id.toString());
        if (!coupon.usageLimitPerUser || !userUsage || userUsage.count < coupon.usageLimitPerUser) {

          if (coupon.type === "percentage") {
            discountAmount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else if (coupon.type === "fixed") {
            discountAmount = coupon.value;
          }

          if (discountAmount > subtotal) discountAmount = subtotal;

          couponDetails = {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount
          };
        }
      }
    } else {
      // Invalid/expired coupon, maybe remove it?
      // For now, just don't apply discount.
    }
  }

  // Cart is already a plain object from lean(), directly add custom fields
  cart.subtotal = subtotal;
  cart.discountAmount = discountAmount;
  cart.totalPrice = subtotal - discountAmount;
  cart.couponDetails = couponDetails;

  res.status(200).json({ cart });
});

export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, selectedOptions } = req.body;

  // validate product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError("Insufficient stock", 400));
  }

  let cart = await Cart.findOne({ clerkId: req.user.clerkId });

  if (!cart) {
    const user = req.user;

    cart = await Cart.create({
      user: user._id,
      clerkId: user.clerkId,
      items: [],
    });
  }

  // check if item already in the cart with the SAME options
  const existingItem = cart.items.find((item) => {
    if (item.product.toString() !== productId) return false;

    // If no options provided, both must be empty
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return !item.selectedOptions || item.selectedOptions.size === 0;
    }

    // Compare options
    if (!item.selectedOptions || item.selectedOptions.size !== Object.keys(selectedOptions).length) {
      return false;
    }

    for (const [key, value] of Object.entries(selectedOptions)) {
      if (item.selectedOptions.get(key) !== value) return false;
    }

    return true;
  });

  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
    if (product.stock < existingItem.quantity) {
      return next(new AppError("Insufficient stock", 400));
    }
  } else {
    // add new item
    cart.items.push({
      product: productId,
      quantity: parseInt(quantity),
      selectedOptions,
    });
  }

  await cart.save();

  res.status(200).json({ message: "Item added to cart", cart });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  const cart = await Cart.findOne({ clerkId: req.user.clerkId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  // check if product exists & validate stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError("Insufficient stock", 400));
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  res.status(200).json({ message: "Cart updated successfully", cart });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ clerkId: req.user.clerkId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  res.status(200).json({ message: "Item removed from cart", cart });
});

export const clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ clerkId: req.user.clerkId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({ message: "Cart cleared", cart });
});

export const applyCoupon = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  if (!code) return next(new AppError("Coupon code is required", 400));

  const cart = await Cart.findOne({ clerkId: req.user.clerkId });
  if (!cart) return next(new AppError("Cart not found", 404));

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return next(new AppError("Invalid or expired coupon", 404));

  // Basic validation (expiry, limits)
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return next(new AppError("Coupon is not active", 400));
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError("Coupon usage limit reached", 400));
  }

  // Check user limit
  const userUsage = coupon.usedBy.find(u => u.userId.toString() === req.user._id.toString());
  if (coupon.usageLimitPerUser && userUsage && userUsage.count >= coupon.usageLimitPerUser) {
    return next(new AppError("You have already used this coupon", 400));
  }

  cart.coupon = coupon.code;
  await cart.save();

  res.status(200).json({ message: "Coupon applied", cart });
});

export const removeCoupon = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ clerkId: req.user.clerkId });
  if (!cart) return next(new AppError("Cart not found", 404));

  cart.coupon = null;
  await cart.save();

  res.status(200).json({ message: "Coupon removed", cart });
});

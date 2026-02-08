import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Vendor } from "../models/vendor.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { cartItems, shippingAddress } = req.body;
  const user = req.user;

  // Validate cart items
  if (!cartItems || cartItems.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  // Calculate total from server-side (don't trust client - ever.)
  let subtotal = 0;
  const validatedItems = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.product._id);
    if (!product) {
      return next(new AppError(`Product ${item.product.name} not found`, 404));
    }

    let price = product.price;
    let name = product.name;
    let image = product.images[0];

    if (item.variantId) {
      const variant = product.variants.find((v) => v._id.toString() === item.variantId);
      if (!variant) {
        return next(new AppError(`Variant not found for ${product.name}`, 404));
      }
      if (variant.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name} (${variant.name})`, 400));
      }
      price = variant.price || product.price;
      name = `${product.name} - ${variant.name}`;
      if (variant.image) image = variant.image;
    } else {
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }
    }

    subtotal += price * item.quantity;
    validatedItems.push({
      product: product._id.toString(),
      variantId: item.variantId,
      name,
      price,
      quantity: item.quantity,
      image,
      selectedOptions: item.selectedOptions,
    });
  }

  const shipping = 10.0; // $10

  // Coupon Logic
  let discountAmount = 0;
  if (req.body.couponCode) {
    const coupon = await Coupon.findOne({ code: req.body.couponCode.toUpperCase(), isActive: true });
    if (coupon) {
      const now = new Date();
      if (now >= coupon.validFrom && now <= coupon.validUntil &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
        (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)) {

        const userUsage = coupon.usedBy.find(u => u.userId.toString() === user._id.toString());
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
        }
      }
    }
  }

  const tax = subtotal * 0.08; // 8%
  const total = subtotal + shipping + tax - discountAmount;

  if (total <= 0) {
    return next(new AppError("Invalid order total", 400));
  }

  // find or create the stripe customer
  // ... (lines 55-72 remain same)
  let customer;
  if (user.stripeCustomerId) {
    customer = await stripe.customers.retrieve(user.stripeCustomerId);
  } else {
    customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        clerkId: user.clerkId,
        userId: user._id.toString(),
      },
    });
    await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
  }

  // create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100), // convert to cents
    currency: "usd",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      clerkId: user.clerkId,
      userId: user._id.toString(),
      orderItems: JSON.stringify(validatedItems),
      shippingAddress: JSON.stringify(shippingAddress),
      totalPrice: total.toFixed(2),
      couponCode: req.body.couponCode || "",
      discountAmount: discountAmount.toFixed(2),
    },
  });

  res.status(200).json({ clientSecret: paymentIntent.client_secret });
});

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    console.log("Payment succeeded:", paymentIntent.id);

    try {
      const { userId, clerkId, orderItems, shippingAddress, totalPrice } = paymentIntent.metadata;

      const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntent.id });
      if (existingOrder) {
        console.log("Order already exists for payment:", paymentIntent.id);
        return res.json({ received: true });
      }

      // create order
      const order = await Order.create({
        user: userId,
        clerkId,
        orderItems: JSON.parse(orderItems),
        shippingAddress: JSON.parse(shippingAddress),
        paymentResult: {
          id: paymentIntent.id,
          status: "succeeded",
        },
        totalPrice: parseFloat(totalPrice),
        couponCode: paymentIntent.metadata.couponCode,
        discountAmount: parseFloat(paymentIntent.metadata.discountAmount || "0"),
      });

      // Update coupon usage
      if (paymentIntent.metadata.couponCode) {
        const coupon = await Coupon.findOne({ code: paymentIntent.metadata.couponCode });
        if (coupon) {
          coupon.usedCount += 1;
          const userUsage = coupon.usedBy.find(u => u.userId.toString() === userId);
          if (userUsage) {
            userUsage.count += 1;
          } else {
            coupon.usedBy.push({ userId: userId, count: 1 });
          }
          await coupon.save();
        }
      }

      // update product stock and vendor earnings
      const items = JSON.parse(orderItems);
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
          if (item.variantId) {
            // Update variant stock
            const variant = product.variants.find((v) => v._id.toString() === item.variantId);
            if (variant) {
              variant.stock -= item.quantity;
              await product.save();
            }
          } else {
            // Update main product stock
            product.stock -= item.quantity;
            await product.save();
          }

          // Update vendor earnings (simplified)
          const vendor = await Vendor.findById(product.vendor);
          if (vendor) {
            const commissionRate = vendor.commissionRate ?? 0.1;
            const vendorEarnings = item.price * item.quantity * (1 - commissionRate);
            vendor.earnings += vendorEarnings;
            await vendor.save();

            // Handle Stripe Connect Transfer
            if (vendor.stripeConnectId && vendor.payoutsEnabled) {
              try {
                await stripe.transfers.create({
                  amount: Math.round(vendorEarnings * 100), // convert to cents
                  currency: "usd",
                  destination: vendor.stripeConnectId,
                  metadata: {
                    orderId: order._id.toString(),
                    productId: product._id.toString(),
                  },
                });
                console.log(`Transferred $${vendorEarnings.toFixed(2)} to vendor ${vendor.shopName}`);
              } catch (transferError) {
                console.error(`Failed to transfer to vendor ${vendor._id}:`, transferError);
              }
            }
          }
        }
      }

      console.log("Order created successfully:", order._id);
    } catch (error) {
      console.error("Error creating order from webhook:", error);
    }
  }

  res.json({ received: true });
}

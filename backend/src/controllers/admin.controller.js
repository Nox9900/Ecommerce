import { clerkClient } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Settings } from "../models/settings.model.js";
import { Shop } from "../models/shop.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, originalPrice, stock, category, subcategory, brand, isSubsidy, soldCount, attributes, variants, shop } = req.body;

  if (!name || !price || !stock || !category) {
    return next(new AppError("Name, price, stock and category are required", 400));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError("At least one image is required", 400));
  }

  if (req.files.length > 3) {
    return next(new AppError("Maximum 3 images allowed", 400));
  }

  // Ensure Admin has a Vendor Profile
  let vendorId = req.user.vendorProfile;
  if (!vendorId) {
    // Check if vendor profile exists but maybe not linked in user obj (edge case) or create new
    let vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
      vendor = await Vendor.create({
        owner: req.user._id,
        shopName: "Admin Store",
        description: "Official Admin Store",
        status: "approved",
      });

      // Link new vendor profile to admin user
      await User.findByIdAndUpdate(req.user._id, { vendorProfile: vendor._id });
    }
    vendorId = vendor._id;
  }

  const uploadPromises = req.files.map((file) => {
    return cloudinary.uploader.upload(file.path, {
      folder: "products",
    });
  });

  const uploadResults = await Promise.all(uploadPromises);

  const imageUrls = uploadResults.map((result) => result.secure_url);

  // Parse and validate variants if provided
  let parsedVariants = [];
  if (variants) {
    const variantsData = JSON.parse(variants);
    parsedVariants = variantsData.map((v) => ({
      name: v.name,
      options: v.options || {},
      price: v.price ? parseFloat(v.price) : parseFloat(price),
      stock: v.stock ? parseInt(v.stock) : 0,
      sku: v.sku || "",
      image: v.image || "",
    }));
  }

  const product = await Product.create({
    name,
    description,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    stock: parseInt(stock),
    category,
    subcategory,
    brand,
    isSubsidy: isSubsidy === "true" || isSubsidy === true,
    soldCount: soldCount ? parseInt(soldCount) : 0,
    attributes: attributes ? JSON.parse(attributes) : [],
    variants: parsedVariants,
    images: imageUrls,
    vendor: vendorId,
    shop: shop || undefined,
  });

  res.status(201).json(product);
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const { q, category, subcategory, minPrice, maxPrice, sort } = req.query;

  const query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  let sortOption = { createdAt: -1 }; // default

  if (sort) {
    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        sortOption = { soldCount: -1 };
        break;
      case "rating":
        sortOption = { averageRating: -1 };
        break;
    }
  }

  const products = await Product.find(query)
    .populate("vendor", "shopName")
    .populate("shop", "name logoUrl")
    .sort(sortOption);

  res.status(200).json(products);
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, originalPrice, stock, category, subcategory, brand, isSubsidy, soldCount, attributes, variants, shop } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Parse and validate variants if provided
  let parsedVariants = undefined;
  if (variants) {
    const variantsData = JSON.parse(variants);
    parsedVariants = variantsData.map((v) => ({
      name: v.name,
      options: v.options || {},
      price: v.price ? parseFloat(v.price) : price ? parseFloat(price) : product.price,
      stock: v.stock ? parseInt(v.stock) : 0,
      sku: v.sku || "",
      image: v.image || "",
    }));
  }

  const updateData = {
    name,
    description,
    price: price ? parseFloat(price) : undefined,
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    stock: stock ? parseInt(stock) : undefined,
    category,
    subcategory,
    brand,
    isSubsidy: isSubsidy !== undefined ? isSubsidy === "true" || isSubsidy === true : undefined,
    soldCount: soldCount !== undefined ? parseInt(soldCount) : undefined,
    attributes: attributes ? JSON.parse(attributes) : undefined,
    variants: parsedVariants,
    shop: shop || undefined,
  };

  // Remove undefined fields to avoid overwriting with null/undefined
  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  // Check for price drop to notify wishlist users
  const oldPrice = product.price;
  const newPrice = updateData.price;
  const isPriceDrop = newPrice && newPrice < oldPrice;

  // Update fields
  Object.assign(product, updateData);

  // handle image updates if new images are uploaded
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      return next(new AppError("Maximum 3 images allowed", 400));
    }

    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    product.images = uploadResults.map((result) => result.secure_url);
  }

  await product.save();

  // Send wishlist price drop notifications if price decreased
  if (isPriceDrop) {
    try {
      const { notifyWishlistPriceDrop } = await import("../services/wishlistNotification.service.js");
      // Fire and forget - don't wait for notifications
      notifyWishlistPriceDrop(product._id, oldPrice, newPrice, product.name).catch(err => {
        console.error("Failed to send wishlist notifications:", err);
      });
    } catch (err) {
      console.error("Error importing wishlist notification service:", err);
    }
  }

  res.status(200).json(product);
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const query = {};

  if (q) {
    query.$or = [
      { _id: q.length === 24 ? q : null },
      { status: { $regex: q, $options: "i" } },
    ];
  }

  const orders = await Order.find(query)
    .populate("user", "name email firstName lastName")
    .populate("orderItems.product")
    .sort({ createdAt: -1 });

  res.status(200).json({ orders });
});

export const getAllShops = catchAsync(async (req, res, next) => {
  const shops = await Shop.find().sort({ name: 1 });
  res.status(200).json(shops);
});

export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const order = await Order.findById(orderId).populate("user");
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  order.status = status;

  if (status === "shipped" && !order.shippedAt) {
    order.shippedAt = new Date();
  }

  if (status === "delivered" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  await order.save();

  // Create notification and send push notification
  try {
    const { Notification } = await import("../models/notification.model.js");
    const { sendOrderStatusNotification } = await import("../services/pushNotification.service.js");

    const orderShortId = order._id.toString().slice(-6);
    const notificationMessages = {
      pending: { title: "Order Placed", body: `Your order #${orderShortId} has been placed successfully!` },
      processing: { title: "Order Processing", body: `Your order #${orderShortId} is being processed.` },
      shipped: { title: "Order Shipped", body: `Great news! Your order #${orderShortId} has been shipped!` },
      delivered: { title: "Order Delivered", body: `Your order #${orderShortId} has been delivered. Enjoy!` },
      cancelled: { title: "Order Cancelled", body: `Your order #${orderShortId} has been cancelled.` },
      refunded: { title: "Order Refunded", body: `Your order #${orderShortId} has been refunded.` },
    };

    const notifMsg = notificationMessages[status] || {
      title: "Order Update",
      body: `Your order #${orderShortId} status has been updated to ${status}.`,
    };

    // Create in-app notification
    const notification = await Notification.create({
      recipient: order.user._id,
      type: status === "shipped" || status === "delivered" ? "delivery" : "order",
      title: notifMsg.title,
      body: notifMsg.body,
      data: { orderId: order._id },
    });

    // Send socket notification
    const io = req.app.get("io");
    if (io) {
      io.to(order.user._id.toString()).emit("notification:new", notification);
    }

    // Send push notification
    await sendOrderStatusNotification(order.user, order._id, status);
  } catch (err) {
    console.error("Failed to send notification:", err);
  }

  res.status(200).json({ message: "Order status updated successfully", order });
});

export const getAllCustomers = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const query = {};

  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { "emailAddresses.emailAddress": { $regex: q, $options: "i" } },
    ];
  }

  const customers = await User.find(query).sort({ createdAt: -1 }); // latest user first
  res.status(200).json({ customers });
});

export const getDashboardStats = catchAsync(async (_, res, next) => {
  const totalOrders = await Order.countDocuments();

  const revenueResult = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  const totalCustomers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const pendingVendors = await Vendor.countDocuments({ status: "pending" });

  res.status(200).json({
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingVendors,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    const deletePromises = product.images.map((imageUrl) => {
      // Extract public_id from URL (assumes format: .../products/publicId.ext)
      const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
      if (publicId) return cloudinary.uploader.destroy(publicId);
    });
    await Promise.all(deletePromises.filter(Boolean));
  }

  await Product.findByIdAndDelete(id);
  res.status(200).json({ message: "Product deleted successfully" });
});

export const getAllVendors = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const query = {};

  if (q) {
    query.$or = [
      { shopName: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const vendors = await Vendor.find(query).populate("owner", "name email").sort({ createdAt: -1 });
  res.status(200).json(vendors);
});

export const updateVendorStatus = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return next(new AppError("Vendor not found", 404));

  vendor.status = status;
  await vendor.save();

  // If approved, update user role
  if (status === "approved") {
    await User.findByIdAndUpdate(vendor.owner, { role: "vendor" });
    const user = await User.findById(vendor.owner);
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { role: "vendor" },
    });
  } else if (status === "rejected" || status === "pending") {
    await User.findByIdAndUpdate(vendor.owner, { role: "customer" });
    const user = await User.findById(vendor.owner);
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { role: "customer" },
    });
  }

  res.status(200).json(vendor);
});

export const deleteVendorRequest = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return next(new AppError("Vendor not found", 404));

  // Remove vendor reference from user profile
  await User.findByIdAndUpdate(vendor.owner, {
    vendorProfile: null,
    role: "customer", // Reset role just in case it was approved
  });

  // Clear clerk metadata if it was set
  const user = await User.findById(vendor.owner);
  if (user && user.clerkId) {
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { role: "customer" },
    });
  }

  await Vendor.findByIdAndDelete(vendorId);

  res.status(200).json({ message: "Vendor request deleted successfully" });
});

export const getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.status(200).json(settings);
});

export const updateSettings = catchAsync(async (req, res, next) => {
  const { globalCommissionRate, platformName, contactEmail } = req.body;

  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
  }

  if (globalCommissionRate !== undefined) settings.globalCommissionRate = globalCommissionRate;
  if (platformName) settings.platformName = platformName;
  if (contactEmail) settings.contactEmail = contactEmail;

  await settings.save();
  res.status(200).json(settings);
});

export const searchAll = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  if (!q) return res.status(200).json({ products: [], orders: [], customers: [], vendors: [] });

  const regex = { $regex: q, $options: "i" };

  const [products, orders, customers, vendors] = await Promise.all([
    Product.find({
      $or: [
        { name: regex },
        { brand: regex },
        { description: regex },
      ],
    })
      .limit(5)
      .populate("shop", "shopName"),

    Order.find({
      $or: [
        { _id: q.length === 24 ? q : null }, // Exact ID if valid length
        { status: regex },
      ],
    })
      .limit(5)
      .populate("user", "firstName lastName"),

    User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { "emailAddresses.emailAddress": regex },
      ],
    }).limit(5),

    Vendor.find({
      $or: [
        { shopName: regex },
        { description: regex },
      ],
    }).limit(5),
  ]);

  res.status(200).json({
    products,
    orders: orders.filter((o) => o !== null),
    customers,
    vendors,
  });
});

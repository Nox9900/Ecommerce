import { clerkClient } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Settings } from "../models/settings.model.js";
import { Shop } from "../models/shop.model.js";

export async function createProduct(req, res) {
  try {
    const { name, description, price, originalPrice, stock, category, subcategory, brand, isSubsidy, soldCount, attributes, shop } = req.body;

    if (!name || !price || !stock || !category) {
      return res.status(400).json({ message: "Name, price, stock and category are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images allowed" });
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
      images: imageUrls,
      vendor: vendorId,
      shop: shop || undefined,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllProducts(_, res) {
  try {
    // -1 means in desc order: most recent products first
    const products = await Product.find()
      .populate("vendor", "shopName")
      .populate("shop", "name logoUrl")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, originalPrice, stock, category, subcategory, brand, isSubsidy, soldCount, attributes, shop } = req.body;

    const updateData = {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      category,
      subcategory,
      brand,
      isSubsidy: isSubsidy !== undefined ? (isSubsidy === "true" || isSubsidy === true) : undefined,
      soldCount: soldCount !== undefined ? parseInt(soldCount) : undefined,
      attributes: attributes ? JSON.parse(attributes) : undefined,
      shop: shop || undefined,
    };

    // Remove undefined fields to avoid overwriting with null/undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // handle image updates if new images are uploaded
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images allowed" });
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
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllOrders(_, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error in getAllOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllShops(req, res) {
  try {
    const shops = await Shop.find().sort({ name: 1 });
    res.status(200).json(shops);
  } catch (error) {
    console.error("Error in getAllShops controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find().sort({ createdAt: -1 }); // latest user first
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDashboardStats(_, res) {
  try {
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
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("owner", "name email").sort({ createdAt: -1 });
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

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
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteVendorRequest = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Remove vendor reference from user profile
    await User.findByIdAndUpdate(vendor.owner, {
      vendorProfile: null,
      role: "customer" // Reset role just in case it was approved
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
  } catch (error) {
    console.error("Error deleting vendor request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Vendor } from "../models/vendor.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";

export const registerVendor = async (req, res) => {
    try {
        const { shopName, description } = req.body;
        const userId = req.user._id;

        if (!shopName || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingVendor = await Vendor.findOne({
            $or: [{ owner: userId }, { shopName }],
        });

        if (existingVendor) {
            return res.status(400).json({ message: "Vendor already exists or shop name taken" });
        }

        const vendor = await Vendor.create({
            owner: userId,
            shopName,
            description,
            status: "pending",
        });

        await User.findByIdAndUpdate(userId, { vendorProfile: vendor._id });

        res.status(201).json(vendor);
    } catch (error) {
        console.error("Error registering vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

        res.status(200).json(vendor);
    } catch (error) {
        console.error("Error fetching vendor profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createVendorProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const vendor = await Vendor.findOne({ owner: req.user._id });

        if (!vendor || vendor.status !== "approved") {
            return res.status(403).json({ message: "Only approved vendors can create products" });
        }

        if (!name || !description || !price || !stock || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
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
            stock: parseInt(stock),
            category,
            images: imageUrls,
            vendor: vendor._id,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating vendor product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVendorProducts = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

        const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVendorStats = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

        const products = await Product.countDocuments({ vendor: vendor._id });

        // This is simplified. In a real app, we'd filter orders by items belonging to this vendor.
        // For now, let's just return the earnings stored in the vendor profile.
        res.status(200).json({
            earnings: vendor.earnings,
            totalProducts: products,
            status: vendor.status,
        });
    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

import cloudinary from "../config/cloudinary.js";
import { Shop } from "../models/shop.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Product } from "../models/product.model.js";

export const createShop = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user._id;

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        const vendor = await Vendor.findOne({ owner: userId });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor profile not found" });
        }

        if (vendor.status !== "approved") {
            return res.status(403).json({ message: "Only approved vendors can create shops" });
        }

        const existingShop = await Shop.findOne({ name });
        if (existingShop) {
            return res.status(400).json({ message: "Shop name already taken" });
        }

        let logoUrl = "";
        let bannerUrl = "";

        if (req.files) {
            if (req.files.logo) {
                const logoUpload = await cloudinary.uploader.upload(req.files.logo[0].path, {
                    folder: "shops/logos",
                });
                logoUrl = logoUpload.secure_url;
            }
            if (req.files.banner) {
                const bannerUpload = await cloudinary.uploader.upload(req.files.banner[0].path, {
                    folder: "shops/banners",
                });
                bannerUrl = bannerUpload.secure_url;
            }
        }

        const shop = await Shop.create({
            name,
            description,
            logoUrl,
            bannerUrl,
            vendor: vendor._id,
            owner: userId,
        });

        res.status(201).json(shop);
    } catch (error) {
        console.error("Error creating shop:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVendorShops = async (req, res) => {
    try {
        const userId = req.user._id;
        const shops = await Shop.find({ owner: userId }).sort({ createdAt: -1 });
        res.status(200).json(shops);
    } catch (error) {
        console.error("Error fetching vendor shops:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getShopById = async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await Shop.findById(id).populate("vendor", "shopName logoUrl");
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const products = await Product.find({ shop: id }).sort({ createdAt: -1 });

        res.status(200).json({ shop, products });
    } catch (error) {
        console.error("Error fetching shop by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRandomShops = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const shops = await Shop.aggregate([{ $sample: { size: limit } }]);

        // Populate vendor info after aggregation if needed, but aggregate sample doesn't support easy populate.
        // We can do it manually or use $lookup. For simplicity:
        const populatedShops = await Shop.populate(shops, { path: "vendor", select: "shopName logoUrl" });

        res.status(200).json(populatedShops);
    } catch (error) {
        console.error("Error fetching random shops:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user._id;

        let shop = await Shop.findOne({ _id: id, owner: userId });
        if (!shop) return res.status(404).json({ message: "Shop not found or unauthorized" });

        if (name) shop.name = name;
        if (description) shop.description = description;

        if (req.files) {
            if (req.files.logo) {
                const logoUpload = await cloudinary.uploader.upload(req.files.logo[0].path, {
                    folder: "shops/logos",
                });
                shop.logoUrl = logoUpload.secure_url;
            }
            if (req.files.banner) {
                const bannerUpload = await cloudinary.uploader.upload(req.files.banner[0].path, {
                    folder: "shops/banners",
                });
                shop.bannerUrl = bannerUpload.secure_url;
            }
        }

        await shop.save();
        res.status(200).json(shop);
    } catch (error) {
        console.error("Error updating shop:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteShop = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const shop = await Shop.findOneAndDelete({ _id: id, owner: userId });
        if (!shop) return res.status(404).json({ message: "Shop not found or unauthorized" });

        // Also delete products associated with this shop? Or just nullify them?
        // Usually, deleting a shop should either delete products or move them to a main shop.
        // For now, let's just delete products too to keep it clean.
        await Product.deleteMany({ shop: id });

        res.status(200).json({ message: "Shop and its products deleted successfully" });
    } catch (error) {
        console.error("Error deleting shop:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

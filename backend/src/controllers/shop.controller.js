import cloudinary from "../config/cloudinary.js";
import { Shop } from "../models/shop.model.js";
import { Vendor } from "../models/vendor.model.js";
import { Product } from "../models/product.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const createShop = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!name || !description) {
        return next(new AppError("Name and description are required", 400));
    }

    const vendor = await Vendor.findOne({ owner: userId });
    if (!vendor) {
        return next(new AppError("Vendor profile not found", 404));
    }

    if (vendor.status !== "approved") {
        return next(new AppError("Only approved vendors can create shops", 403));
    }

    const existingShop = await Shop.findOne({ name });
    if (existingShop) {
        return next(new AppError("Shop name already taken", 400));
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
});

export const getVendorShops = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    const userId = req.user._id;
    const query = { owner: userId };

    if (q) {
        query.$or = [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
        ];
    }

    const shops = await Shop.find(query).sort({ createdAt: -1 });
    res.status(200).json(shops);
});

export const getShopById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const shop = await Shop.findById(id).populate("vendor", "shopName logoUrl");
    if (!shop) return next(new AppError("Shop not found", 404));

    const products = await Product.find({ shop: id }).sort({ createdAt: -1 });

    res.status(200).json({ shop, products });
});

export const getRandomShops = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 5;
    const shops = await Shop.aggregate([{ $sample: { size: limit } }]);

    // Populate vendor info after aggregation if needed, but aggregate sample doesn't support easy populate.
    // We can do it manually or use $lookup. For simplicity:
    const populatedShops = await Shop.populate(shops, { path: "vendor", select: "shopName logoUrl" });

    res.status(200).json(populatedShops);
});

export const updateShop = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    let shop = await Shop.findOne({ _id: id, owner: userId });
    if (!shop) return next(new AppError("Shop not found or unauthorized", 404));

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
});

export const deleteShop = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const shop = await Shop.findOneAndDelete({ _id: id, owner: userId });
    if (!shop) return next(new AppError("Shop not found or unauthorized", 404));

    // Also delete products associated with this shop? Or just nullify them?
    // Usually, deleting a shop should either delete products or move them to a main shop.
    // For now, let's just delete products too to keep it clean.
    await Product.deleteMany({ shop: id });

    res.status(200).json({ message: "Shop and its products deleted successfully" });
});

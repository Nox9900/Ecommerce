import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Vendor } from "../models/vendor.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const registerVendor = catchAsync(async (req, res, next) => {
    const { shopName, description } = req.body;
    const userId = req.user._id;

    if (!shopName || !description) {
        return next(new AppError("All fields are required", 400));
    }

    const existingVendor = await Vendor.findOne({
        $or: [{ owner: userId }, { shopName }],
    });

    if (existingVendor) {
        return next(new AppError("Vendor already exists or shop name taken", 400));
    }

    const vendor = await Vendor.create({
        owner: userId,
        shopName,
        description,
        status: "pending",
    });

    await User.findByIdAndUpdate(userId, { vendorProfile: vendor._id });

    res.status(201).json(vendor);
});

export const getVendorProfile = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return next(new AppError("Vendor profile not found", 404));

    res.status(200).json(vendor);
});

export const createVendorProduct = catchAsync(async (req, res, next) => {
    const { name, description, price, stock, category, shop, attributes } = req.body;
    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor || vendor.status !== "approved") {
        return next(new AppError("Only approved vendors can create products", 403));
    }

    if (!name || !description || !price || !stock || !category) {
        return next(new AppError("All fields are required", 400));
    }

    if (!req.files || req.files.length === 0) {
        // We need to check if main images are present, but since we use upload.any(), 
        // req.files includes everything. We will filter later.
    }

    const productImages = req.files.filter(file => file.fieldname === "images");

    if (productImages.length === 0) {
        return next(new AppError("At least one product image is required", 400));
    }

    const uploadPromises = productImages.map((file) => {
        return cloudinary.uploader.upload(file.path, {
            folder: "products",
        });
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // Handle variant images
    let parsedVariants = [];
    if (req.body.variants) {
        parsedVariants = JSON.parse(req.body.variants);

        // Upload variant images
        const variantImagePromises = parsedVariants.map(async (variant, index) => {
            const variantImageFile = req.files.find(
                (file) => file.fieldname === `variant_image_${index}`
            );

            if (variantImageFile) {
                const result = await cloudinary.uploader.upload(variantImageFile.path, {
                    folder: "products/variants",
                });
                variant.image = result.secure_url;
            }
            return variant;
        });

        parsedVariants = await Promise.all(variantImagePromises);
    }

    const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
        stock: parseInt(stock),
        category,
        subcategory: req.body.subcategory,
        brand: req.body.brand,
        isSubsidy: req.body.isSubsidy === "true" || req.body.isSubsidy === true,
        soldCount: req.body.soldCount ? parseInt(req.body.soldCount) : 0,
        attributes: attributes ? JSON.parse(attributes) : [],
        images: imageUrls,
        variants: parsedVariants,
        vendor: vendor._id,
        shop: shop || undefined,
    });

    res.status(201).json(product);
});

export const getVendorProducts = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return next(new AppError("Vendor profile not found", 404));

    const query = { vendor: vendor._id };
    if (q) {
        query.$or = [
            { name: { $regex: q, $options: "i" } },
            { brand: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
        ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
});

export const getVendorStats = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return next(new AppError("Vendor profile not found", 404));

    const products = await Product.countDocuments({ vendor: vendor._id });

    // This is simplified. In a real app, we'd filter orders by items belonging to this vendor.
    // For now, let's just return the earnings stored in the vendor profile.
    res.status(200).json({
        earnings: vendor.earnings,
        totalProducts: products,
        status: vendor.status,
    });
});

export const updateVendorProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, price, stock, category, subcategory, brand, isSubsidy, soldCount, shop, attributes } = req.body;
    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor || vendor.status !== "approved") {
        return next(new AppError("Only approved vendors can update products", 403));
    }

    const product = await Product.findOne({ _id: id, vendor: vendor._id });
    if (!product) {
        return next(new AppError("Product not found or not owned by you", 404));
    }

    const updateData = {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        category,
        subcategory,
        brand,
        isSubsidy: isSubsidy !== undefined ? (isSubsidy === "true" || isSubsidy === true) : undefined,
        soldCount: soldCount !== undefined ? parseInt(soldCount) : undefined,
        attributes: attributes ? JSON.parse(attributes) : undefined,
        shop: shop || undefined,
    };

    // Handle variants update
    if (req.body.variants) {
        let parsedVariants = JSON.parse(req.body.variants);

        // Upload new variant images
        const variantImagePromises = parsedVariants.map(async (variant, index) => {
            const variantImageFile = req.files.find(
                (file) => file.fieldname === `variant_image_${index}`
            );

            if (variantImageFile) {
                const result = await cloudinary.uploader.upload(variantImageFile.path, {
                    folder: "products/variants",
                });
                variant.image = result.secure_url;
            }
            return variant;
        });

        updateData.variants = await Promise.all(variantImagePromises);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    // Merge updates
    Object.assign(product, updateData);

    // handle image updates
    if (req.files && req.files.length > 0) {
        const productImages = req.files.filter(file => file.fieldname === "images");

        if (productImages.length > 0) {
            if (productImages.length > 3) {
                return next(new AppError("Maximum 3 images allowed", 400));
            }

            const uploadPromises = productImages.map((file) => {
                return cloudinary.uploader.upload(file.path, {
                    folder: "products",
                });
            });

            const uploadResults = await Promise.all(uploadPromises);
            product.images = uploadResults.map((result) => result.secure_url);
        }
    }

    await product.save();
    res.status(200).json(product);
});

export const vendorSearch = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return next(new AppError("Vendor profile not found", 404));

    if (!q) return res.status(200).json({ products: [], orders: [] });

    const regex = { $regex: q, $options: "i" };

    const [products, orders] = await Promise.all([
        Product.find({
            vendor: vendor._id,
            $or: [
                { name: regex },
                { brand: regex },
                { description: regex },
            ],
        }).limit(5),

        Order.find({
            "items.product": { $in: await Product.find({ vendor: vendor._id }).distinct("_id") },
            $or: [
                { _id: q.length === 24 ? q : null },
                { status: regex },
            ],
        })
            .limit(5)
            .populate("user", "firstName lastName"),
    ]);

    res.status(200).json({
        products,
        orders: orders.filter((o) => o !== null),
    });
});

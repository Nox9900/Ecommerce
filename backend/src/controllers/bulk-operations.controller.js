import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Vendor } from "../models/vendor.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

// Admin Bulk Delete Products
export const bulkDeleteProducts = catchAsync(async (req, res, next) => {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    // Fetch products to delete their images from Cloudinary
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
        return next(new AppError("No products found", 404));
    }

    // Delete images from Cloudinary
    const deleteImagePromises = products.flatMap((product) => {
        if (product.images && product.images.length > 0) {
            return product.images.map((imageUrl) => {
                try {
                    const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
                    if (publicId) return cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error parsing image URL:", err);
                    return null;
                }
            });
        }
        return [];
    });

    await Promise.allSettled(deleteImagePromises.filter(Boolean));

    // Delete products from database
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.status(200).json({
        message: `Successfully deleted ${result.deletedCount} product(s)`,
        deletedCount: result.deletedCount,
    });
});

// Admin Bulk Update Product Stock
export const bulkUpdateProductStock = catchAsync(async (req, res, next) => {
    const { productIds, stock } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    if (stock === undefined || stock === null) {
        return next(new AppError("Stock value is required", 400));
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
        return next(new AppError("Stock must be a non-negative number", 400));
    }

    // Update products
    const result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { stock: stockValue } }
    );

    res.status(200).json({
        message: `Successfully updated stock for ${result.modifiedCount} product(s)`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
    });
});

// Vendor Bulk Delete Products (only their own)
export const vendorBulkDeleteProducts = catchAsync(async (req, res, next) => {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    // Get vendor profile
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
        return next(new AppError("Vendor profile not found", 404));
    }

    // Fetch products that belong to this vendor
    const products = await Product.find({
        _id: { $in: productIds },
        vendor: vendor._id,
    });

    if (products.length === 0) {
        return next(new AppError("No products found or you don't have permission to delete these products", 404));
    }

    // Delete images from Cloudinary
    const deleteImagePromises = products.flatMap((product) => {
        if (product.images && product.images.length > 0) {
            return product.images.map((imageUrl) => {
                try {
                    const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
                    if (publicId) return cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Error parsing image URL:", err);
                    return null;
                }
            });
        }
        return [];
    });

    await Promise.allSettled(deleteImagePromises.filter(Boolean));

    // Delete products from database (only vendor's products)
    const result = await Product.deleteMany({
        _id: { $in: productIds },
        vendor: vendor._id,
    });

    res.status(200).json({
        message: `Successfully deleted ${result.deletedCount} product(s)`,
        deletedCount: result.deletedCount,
    });
});

// Vendor Bulk Update Product Stock (only their own)
export const vendorBulkUpdateProductStock = catchAsync(async (req, res, next) => {
    const { productIds, stock } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new AppError("Product IDs array is required", 400));
    }

    if (stock === undefined || stock === null) {
        return next(new AppError("Stock value is required", 400));
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
        return next(new AppError("Stock must be a non-negative number", 400));
    }

    // Get vendor profile
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
        return next(new AppError("Vendor profile not found", 404));
    }

    // Update products (only vendor's products)
    const result = await Product.updateMany(
        { _id: { $in: productIds }, vendor: vendor._id },
        { $set: { stock: stockValue } }
    );

    res.status(200).json({
        message: `Successfully updated stock for ${result.modifiedCount} product(s)`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
    });
});

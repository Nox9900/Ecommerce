import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { UserBehavior } from "../models/userBehavior.model.js";
import { catchAsync } from "../lib/catchAsync.js";

// Helper to get trending products
const fetchTrendingProducts = async (limit = 10) => {
    return await Product.find({})
        .sort({ soldCount: -1 })
        .limit(limit)
        .select("name price images averageRating soldCount category subcategory");
};

export const getTrendingProducts = catchAsync(async (req, res, next) => {
    const products = await fetchTrendingProducts();
    res.status(200).json(products);
});

export const getFrequentlyBoughtTogether = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Find orders that contain this product
    const orders = await Order.find({ "orderItems.product": id })
        .select("orderItems")
        .limit(100)
        .populate("orderItems.product"); // Populate to check if product exists

    const productCounts = {};

    orders.forEach((order) => {
        order.orderItems.forEach((item) => {
            if (item.product && item.product._id.toString() !== id) {
                const productId = item.product._id.toString();
                productCounts[productId] = (productCounts[productId] || 0) + 1;
            }
        });
    });

    // Sort by frequency
    const sortedProductIds = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1]) // Descending sort by count
        .slice(0, 5) // Top 5
        .map((entry) => entry[0]);

    let products = [];
    if (sortedProductIds.length > 0) {
        products = await Product.find({ _id: { $in: sortedProductIds } })
            .select("name price images averageRating soldCount category subcategory");
    }

    // If not enough data, fallback to trending or related in same category (optional, but let's just return what we have or empty)
    // User asked for "Frequently Bought Together", if none, maybe just return empty or generic popular items? 
    // Let's return empty if really no data, or maybe trending if we want to fill the UI.
    // For "Frequently Bought Together" specifically, false data is bad. Let's return real data only.

    res.status(200).json(products);
});

export const getPersonalizedRecommendations = catchAsync(async (req, res, next) => {
    if (!req.user) {
        // Fallback to trending if not authenticated
        const trending = await fetchTrendingProducts();
        return res.status(200).json(trending);
    }

    const behavior = await UserBehavior.findOne({ user: req.user._id }).populate("viewedProducts.product");

    if (!behavior || behavior.viewedProducts.length === 0) {
        const trending = await fetchTrendingProducts();
        return res.status(200).json(trending);
    }

    // Get categories and subcategories from viewed products
    const categories = new Set();
    const subcategories = new Set();
    const viewedProductIds = new Set();

    behavior.viewedProducts.forEach((vp) => {
        if (vp.product) {
            categories.add(vp.product.category);
            if (vp.product.subcategory) subcategories.add(vp.product.subcategory);
            viewedProductIds.add(vp.product._id.toString());
        }
    });

    // 1. Find products in same subcategories (high relevance)
    // 2. Find products in same categories (medium relevance)
    // 3. Exclude already viewed products

    let recommendations = await Product.find({
        $and: [
            { _id: { $nin: Array.from(viewedProductIds) } },
            {
                $or: [
                    { subcategory: { $in: Array.from(subcategories) } },
                    { category: { $in: Array.from(categories) } },
                ]
            }
        ]
    })
        .sort({ soldCount: -1, averageRating: -1 }) // Sort by popularity within relevant categories
        .limit(10)
        .select("name price images averageRating soldCount category subcategory");

    // If we don't have enough recommendations, fill with trending products
    if (recommendations.length < 10) {
        const trending = await fetchTrendingProducts(10 - recommendations.length);
        // Filter out duplicates
        const existingIds = new Set(recommendations.map(p => p._id.toString()));
        const newTrending = trending.filter(p => !existingIds.has(p._id.toString()) && !viewedProductIds.has(p._id.toString()));

        recommendations = [...recommendations, ...newTrending];
    }

    res.status(200).json(recommendations);
});

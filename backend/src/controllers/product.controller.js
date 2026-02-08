import { Product } from "../models/product.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("vendor", "shopName").populate("shop", "name logoUrl");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Track user behavior if authenticated
  if (req.user) {
    try {
      const { UserBehavior } = await import("../models/userBehavior.model.js");
      await UserBehavior.findOneAndUpdate(
        { user: req.user._id },
        {
          $push: {
            viewedProducts: {
              $each: [{ product: product._id }],
              $position: 0,
              $slice: 50, // Keep last 50 views
            },
          },
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error tracking user behavior:", error);
      // Don't block the response if tracking fails
    }
  }

  res.status(200).json(product);
});

export const searchProducts = catchAsync(async (req, res, next) => {
  const { q, category, subcategory, minPrice, maxPrice, sort, minRating, page = 1, limit = 20 } = req.query;

  const query = {};

  if (q) {
    query.$or = [
      { brand: { $regex: q, $options: "i" } },
    ];

    // Track search query if authenticated
    if (req.user) {
      try {
        const { UserBehavior } = await import("../models/userBehavior.model.js");
        await UserBehavior.findOneAndUpdate(
          { user: req.user._id },
          {
            $push: {
              searchQueries: {
                $each: [{ query: q }],
                $position: 0,
                $slice: 50, // Keep last 50 queries
              },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error("Error tracking search query:", error);
      }
    }
  }

  if (category && category !== "all") query.category = category;
  if (subcategory) query.subcategory = subcategory;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (minRating) {
    query.averageRating = { $gte: parseFloat(minRating) };
  }

  let sortOption = { createdAt: -1 }; // default: latest

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

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const products = await Product.find(query)
    .populate("vendor", "shopName")
    .populate("shop", "name logoUrl")
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

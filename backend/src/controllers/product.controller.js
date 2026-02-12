import { Product } from "../models/product.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";
import {
  parsePaginationParams,
  buildCursorQuery,
  buildPaginationResponse,
  selectFields,
  buildProductSearchPipeline,
} from "../utils/queryOptimization.js";

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
  const { q, category, subcategory, minPrice, maxPrice, sort, minRating, vendor } = req.query;
  const { page, limit, cursor, useCursor, skip } = parsePaginationParams(req.query);

  const query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { subcategory: { $regex: q, $options: "i" } },
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
  if (vendor) query.vendor = vendor;

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

  // Use cursor-based pagination if requested
  if (useCursor) {
    const cursorQuery = buildCursorQuery(cursor, sortOption);
    Object.assign(query, cursorQuery);

    // Fetch one extra to check if there's a next page
    const products = await Product.find(query)
      .select('name description price originalPrice brand soldCount stock category subcategory images averageRating totalReviews variants createdAt updatedAt vendor shop')
      .populate(selectFields('vendor', 'shopName _id'))
      .populate(selectFields('shop', 'name logoUrl _id'))
      .sort(sortOption)
      .limit(limit + 1)
      .lean();

    const paginationResult = buildPaginationResponse(products, limit, sortOption);

    return res.status(200).json({
      products: paginationResult.results,
      hasNextPage: paginationResult.hasNextPage,
      nextCursor: paginationResult.nextCursor,
      useCursor: true,
    });
  }

  // Traditional offset-based pagination with aggregation
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Use aggregation pipeline for better performance
  const pipeline = buildProductSearchPipeline(query, sortOption, skip, limitNum);
  const [products, countResult] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    products,
    total: countResult,
    page: pageNum,
    pages: Math.ceil(countResult / limitNum),
  });
});

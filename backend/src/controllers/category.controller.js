import { Category } from "../models/category.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

// Public: Get all active categories
export const getActiveCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json(categories);
});

// Admin: Get all categories
export const getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json(categories);
});

// Admin/Vendor: Create category
export const createCategory = catchAsync(async (req, res, next) => {
    const categoryData = { ...req.body };

    // If not admin, force isActive to false for moderation
    if (req.user.role !== "admin") {
        categoryData.isActive = false;
    }

    // Handle duplicate key error within the global error handler or here if specific message needed?
    // Global handler handles code 11000 generically. If specific message "Category name must be unique" is strictly required,
    // we can check existence first or use try/catch just for this specific case...
    // BUT cleanest is to let global handler do it or check manually:
    const existing = await Category.findOne({ name: categoryData.name });
    if (existing) {
        return next(new AppError("Category name must be unique", 400));
    }

    const category = await Category.create(categoryData);
    res.status(201).json(category);
});

// Admin: Update category
export const updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
        return next(new AppError("Category not found", 404));
    }
    res.status(200).json(category);
});

// Admin: Delete category
export const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        return next(new AppError("Category not found", 404));
    }
    res.status(200).json({ message: "Category deleted successfully" });
});

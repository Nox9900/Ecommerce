import { Category } from "../models/category.model.js";

// Public: Get all active categories
export async function getActiveCategories(req, res) {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching active categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Get all categories
export async function getAllCategories(req, res) {
    try {
        const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching all categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Create category
export async function createCategory(req, res) {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category name must be unique" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Update category
export async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Delete category
export async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

import { PromoBanner } from "../models/promoBanner.model.js";

// Public: Get active promo banners
export async function getActivePromoBanners(req, res) {
    try {
        const banners = await PromoBanner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json(banners);
    } catch (error) {
        console.error("Error fetching active promo banners:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Get all promo banners
export async function getAllPromoBanners(req, res) {
    try {
        const banners = await PromoBanner.find().sort({ displayOrder: 1 });
        res.status(200).json(banners);
    } catch (error) {
        console.error("Error fetching all promo banners:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Create promo banner
export async function createPromoBanner(req, res) {
    try {
        const banner = await PromoBanner.create(req.body);
        res.status(201).json(banner);
    } catch (error) {
        console.error("Error creating promo banner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Update promo banner
export async function updatePromoBanner(req, res) {
    try {
        const { id } = req.params;
        const banner = await PromoBanner.findByIdAndUpdate(id, req.body, { new: true });
        if (!banner) return res.status(404).json({ message: "Promo banner not found" });
        res.status(200).json(banner);
    } catch (error) {
        console.error("Error updating promo banner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Delete promo banner
export async function deletePromoBanner(req, res) {
    try {
        const { id } = req.params;
        const banner = await PromoBanner.findByIdAndDelete(id);
        if (!banner) return res.status(404).json({ message: "Promo banner not found" });
        res.status(200).json({ message: "Promo banner deleted successfully" });
    } catch (error) {
        console.error("Error deleting promo banner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

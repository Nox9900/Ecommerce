import { PromoBanner } from "../models/promoBanner.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

// Public: Get active promo banners
export const getActivePromoBanners = catchAsync(async (req, res, next) => {
    const banners = await PromoBanner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(banners);
});

// Admin: Get all promo banners
export const getAllPromoBanners = catchAsync(async (req, res, next) => {
    const banners = await PromoBanner.find().sort({ displayOrder: 1 });
    res.status(200).json(banners);
});

// Admin: Create promo banner
export const createPromoBanner = catchAsync(async (req, res, next) => {
    const banner = await PromoBanner.create(req.body);
    res.status(201).json(banner);
});

// Admin: Update promo banner
export const updatePromoBanner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const banner = await PromoBanner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) return next(new AppError("Promo banner not found", 404));
    res.status(200).json(banner);
});

// Admin: Delete promo banner
export const deletePromoBanner = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const banner = await PromoBanner.findByIdAndDelete(id);
    if (!banner) return next(new AppError("Promo banner not found", 404));
    res.status(200).json({ message: "Promo banner deleted successfully" });
});

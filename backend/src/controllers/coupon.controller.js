import { Coupon } from "../models/coupon.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

// Create a new coupon
export const createCoupon = catchAsync(async (req, res, next) => {
    const {
        code,
        type,
        value,
        minOrderValue,
        maxDiscount,
        usageLimit,
        usageLimitPerUser,
        validFrom,
        validUntil,
        applicableCategories,
        vendor, // Should be passed if vendor-specific, otherwise null/undefined
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
        return next(new AppError("Coupon code already exists", 400));
    }

    // Create coupon
    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        type,
        value,
        minOrderValue,
        maxDiscount,
        usageLimit,
        usageLimitPerUser,
        validFrom: validFrom || Date.now(),
        validUntil,
        applicableCategories,
        vendor: vendor || null,
        createdBy: req.user._id, // Assumes req.user is populated by auth middleware
    });

    res.status(201).json({
        status: "success",
        data: {
            coupon,
        },
    });
});

// Get all coupons (with filters)
export const getCoupons = catchAsync(async (req, res, next) => {
    const filter = {};

    // If user is a vendor, only show their coupons (unless admin - handled by route protection/logic ideally)
    // For now, let's assume query params control filtering, but we enforce vendor ownership if needed
    if (req.query.vendorId) {
        filter.vendor = req.query.vendorId;
    }

    if (req.query.isActive) {
        filter.isActive = req.query.isActive === 'true';
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        results: coupons.length,
        data: {
            coupons,
        },
    });
});

// Get single coupon
export const getCouponById = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        return next(new AppError("No coupon found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            coupon,
        },
    });
});

// Update coupon
export const updateCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!coupon) {
        return next(new AppError("No coupon found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            coupon,
        },
    });
});

// Delete coupon (Soft delete)
export const deleteCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!coupon) {
        return next(new AppError("No coupon found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

// Validate coupon logic
export const validateCoupon = catchAsync(async (req, res, next) => {
    const { code, cartTotal, cartItems } = req.body;
    const userId = req.user._id;

    if (!code) {
        return next(new AppError("Please provide a coupon code", 400));
    }

    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
    });

    if (!coupon) {
        return next(new AppError("Invalid or expired coupon code", 404));
    }

    // 1. Check expiration
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
        return next(new AppError("Coupon is not active currently", 400));
    }

    // 2. Check global usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return next(new AppError("Coupon usage limit reached", 400));
    }

    // 3. Check per-user usage limit
    const userUsage = coupon.usedBy.find(
        (u) => u.userId.toString() === userId.toString()
    );
    if (userUsage && userUsage.count >= coupon.usageLimitPerUser) {
        return next(new AppError("You have already used this coupon", 400));
    }

    // 4. Check minimum order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
        return next(
            new AppError(
                `Minimum order value of $${coupon.minOrderValue} required`,
                400
            )
        );
    }

    // 5. Vendor restrictions (if applicable)
    if (coupon.vendor) {
        // Check if ALL items in cart belong to this vendor? Or at least one?
        // Usually coupons are either platform-wide or specific to a shop.
        // Platform coupons apply to total. Shop coupons apply to shop items only.
        // For simplicity, let's assume valid if applied to a cart that contains items.
        // But typically a cart might be split by vendor.
        // If cart has mixed vendors, specific vendor coupon validates but only applies to that vendor's items.
        // For now, let's just validate existence. Logic for calculation happens below.

        // We assume the frontend/cart logic separates orders by vendor or we handle mixed carts.
        // If `cartItems` is provided, we can check.
        if (cartItems && cartItems.length > 0) {
            // logic to check compatibility can go here
            // For now, accepting.
        }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
        discountAmount = (cartTotal * coupon.value) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    } else if (coupon.type === "fixed") {
        discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    res.status(200).json({
        status: "success",
        data: {
            valid: true,
            code: coupon.code,
            discountAmount,
            type: coupon.type,
            value: coupon.value,
            message: "Coupon applied successfully",
        },
    });
});

// Get coupon stats
export const getCouponStats = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        return next(new AppError("Coupon not found", 404));
    }

    // Calculate total discount given (approximate if we don't query orders)
    // Better to aggregate from Orders if strict accuracy needed, 
    // but `usedCount` gives us usage volume.

    res.status(200).json({
        status: "success",
        data: {
            usedCount: coupon.usedCount,
            usageLimit: coupon.usageLimit,
            usageLimitPerUser: coupon.usageLimitPerUser
        }
    });
});

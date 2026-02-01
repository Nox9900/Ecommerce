import { Withdrawal } from "../models/withdrawal.model.js";
import { Vendor } from "../models/vendor.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

export const requestWithdrawal = catchAsync(async (req, res, next) => {
    const { amount, bankDetails } = req.body;
    const vendor = await Vendor.findOne({ owner: req.user._id });

    if (!vendor || vendor.status !== "approved") {
        return next(new AppError("Only approved vendors can request withdrawals", 403));
    }

    if (amount > vendor.earnings) {
        return next(new AppError("Insufficient earnings", 400));
    }

    if (amount < 1) {
        return next(new AppError("Minimum withdrawal amount is $1", 400));
    }

    const withdrawal = await Withdrawal.create({
        vendor: vendor._id,
        amount,
        bankDetails,
    });

    res.status(201).json(withdrawal);
});

export const getVendorWithdrawals = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return next(new AppError("Vendor profile not found", 404));

    const withdrawals = await Withdrawal.find({ vendor: vendor._id }).sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
});

export const getAllWithdrawals = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    const query = {};

    if (q) {
        query.$or = [
            { status: { $regex: q, $options: "i" } },
            { _id: q.length === 24 ? q : null },
        ];
    }

    const withdrawals = await Withdrawal.find(query)
        .populate({
            path: "vendor",
            populate: { path: "owner", select: "name email" },
        })
        .sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
});

export const updateWithdrawalStatus = catchAsync(async (req, res, next) => {
    const { withdrawalId } = req.params;
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        return next(new AppError("Invalid status", 400));
    }

    const withdrawal = await Withdrawal.findById(withdrawalId).populate("vendor");
    if (!withdrawal) return next(new AppError("Withdrawal request not found", 404));

    if (withdrawal.status !== "pending") {
        return next(new AppError("Withdrawal request already processed", 400));
    }

    if (status === "approved") {
        const vendor = await Vendor.findById(withdrawal.vendor._id);
        if (vendor.earnings < withdrawal.amount) {
            return next(new AppError("Vendor has insufficient earnings now", 400));
        }

        vendor.earnings -= withdrawal.amount;
        await vendor.save();

        withdrawal.processedAt = new Date();
    }

    withdrawal.status = status;
    withdrawal.adminNote = adminNote;
    await withdrawal.save();

    res.status(200).json(withdrawal);
});

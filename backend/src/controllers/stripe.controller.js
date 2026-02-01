import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { Vendor } from "../models/vendor.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export const createConnectAccount = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return next(new AppError("Vendor profile not found", 404));

    if (vendor.stripeConnectId) {
        return next(new AppError("Stripe Connect account already exists", 400));
    }

    const account = await stripe.accounts.create({
        type: "express",
        email: req.user.email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        metadata: {
            vendorId: vendor._id.toString(),
            userId: req.user._id.toString(),
        },
    });

    vendor.stripeConnectId = account.id;
    await vendor.save();

    res.status(200).json({ stripeConnectId: account.id });
});

export const createAccountLink = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor || !vendor.stripeConnectId) {
        return next(new AppError("Vendor or Stripe Connect account not found", 404));
    }

    const accountLink = await stripe.accountLinks.create({
        account: vendor.stripeConnectId,
        refresh_url: `${ENV.CLIENT_URL}/vendor/onboarding/refresh`,
        return_url: `${ENV.CLIENT_URL}/vendor/onboarding/complete`,
        type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
});

export const getConnectAccountStatus = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor || !vendor.stripeConnectId) {
        return res.status(200).json({ payoutsEnabled: false });
    }

    const account = await stripe.accounts.retrieve(vendor.stripeConnectId);

    // Update vendor status based on Stripe account status
    vendor.payoutsEnabled = account.payouts_enabled;
    await vendor.save();

    res.status(200).json({
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        stripeConnectId: vendor.stripeConnectId,
    });
});

export const createLoginLink = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor || !vendor.stripeConnectId) {
        return next(new AppError("Stripe Connect account not found", 404));
    }

    const loginLink = await stripe.accounts.createLoginLink(vendor.stripeConnectId);
    res.status(200).json({ url: loginLink.url });
});

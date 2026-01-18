import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { Vendor } from "../models/vendor.model.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export const createConnectAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

        if (vendor.stripeConnectId) {
            return res.status(400).json({ message: "Stripe Connect account already exists" });
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
    } catch (error) {
        console.error("Error creating Connect account:", error);
        res.status(500).json({ message: "Failed to create Stripe Connect account" });
    }
};

export const createAccountLink = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor || !vendor.stripeConnectId) {
            return res.status(404).json({ message: "Vendor or Stripe Connect account not found" });
        }

        const accountLink = await stripe.accountLinks.create({
            account: vendor.stripeConnectId,
            refresh_url: `${ENV.CLIENT_URL}/vendor/onboarding/refresh`,
            return_url: `${ENV.CLIENT_URL}/vendor/onboarding/complete`,
            type: "account_onboarding",
        });

        res.status(200).json({ url: accountLink.url });
    } catch (error) {
        console.error("Error creating account link:", error);
        res.status(500).json({ message: "Failed to create account link" });
    }
};

export const getConnectAccountStatus = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error fetching Connect account status:", error);
        res.status(500).json({ message: "Failed to fetch account status" });
    }
};

export const createLoginLink = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor || !vendor.stripeConnectId) {
            return res.status(404).json({ message: "Stripe Connect account not found" });
        }

        const loginLink = await stripe.accounts.createLoginLink(vendor.stripeConnectId);
        res.status(200).json({ url: loginLink.url });
    } catch (error) {
        console.error("Error creating login link:", error);
        res.status(500).json({ message: "Failed to create login link" });
    }
};

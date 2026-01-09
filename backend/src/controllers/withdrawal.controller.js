import { Withdrawal } from "../models/withdrawal.model.js";
import { Vendor } from "../models/vendor.model.js";

export const requestWithdrawal = async (req, res) => {
    try {
        const { amount, bankDetails } = req.body;
        const vendor = await Vendor.findOne({ owner: req.user._id });

        if (!vendor || vendor.status !== "approved") {
            return res.status(403).json({ message: "Only approved vendors can request withdrawals" });
        }

        if (amount > vendor.earnings) {
            return res.status(400).json({ message: "Insufficient earnings" });
        }

        if (amount < 1) {
            return res.status(400).json({ message: "Minimum withdrawal amount is $1" });
        }

        const withdrawal = await Withdrawal.create({
            vendor: vendor._id,
            amount,
            bankDetails,
        });

        res.status(201).json(withdrawal);
    } catch (error) {
        console.error("Error requesting withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getVendorWithdrawals = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user._id });
        if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

        const withdrawals = await Withdrawal.find({ vendor: vendor._id }).sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        console.error("Error fetching vendor withdrawals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find()
            .populate({
                path: "vendor",
                populate: { path: "owner", select: "name email" }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        console.error("Error fetching all withdrawals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateWithdrawalStatus = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { status, adminNote } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const withdrawal = await Withdrawal.findById(withdrawalId).populate("vendor");
        if (!withdrawal) return res.status(404).json({ message: "Withdrawal request not found" });

        if (withdrawal.status !== "pending") {
            return res.status(400).json({ message: "Withdrawal request already processed" });
        }

        if (status === "approved") {
            const vendor = await Vendor.findById(withdrawal.vendor._id);
            if (vendor.earnings < withdrawal.amount) {
                return res.status(400).json({ message: "Vendor has insufficient earnings now" });
            }

            vendor.earnings -= withdrawal.amount;
            await vendor.save();

            withdrawal.processedAt = new Date();
        }

        withdrawal.status = status;
        withdrawal.adminNote = adminNote;
        await withdrawal.save();

        res.status(200).json(withdrawal);
    } catch (error) {
        console.error("Error updating withdrawal status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

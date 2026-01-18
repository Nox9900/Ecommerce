import { Router } from "express";
import {
    registerVendor,
    getVendorProfile,
    createVendorProduct,
    getVendorProducts,
    getVendorStats,
} from "../controllers/vendor.controller.js";
import {
    createConnectAccount,
    createAccountLink,
    getConnectAccountStatus,
    createLoginLink,
} from "../controllers/stripe.controller.js";
import {
    requestWithdrawal,
    getVendorWithdrawals
} from "../controllers/withdrawal.controller.js";
import { protectRoute, vendorOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post("/register", protectRoute, registerVendor);
router.get("/profile", protectRoute, vendorOnly, getVendorProfile);
router.get("/stats", protectRoute, vendorOnly, getVendorStats);
router.get("/products", protectRoute, vendorOnly, getVendorProducts);
router.post("/products", protectRoute, vendorOnly, upload.array("images", 3), createVendorProduct);
router.post("/withdrawals", protectRoute, vendorOnly, requestWithdrawal);
router.get("/withdrawals", protectRoute, vendorOnly, getVendorWithdrawals);

// Stripe Connect Routes
router.post("/connect/account", protectRoute, vendorOnly, createConnectAccount);
router.post("/connect/account-link", protectRoute, vendorOnly, createAccountLink);
router.get("/connect/status", protectRoute, vendorOnly, getConnectAccountStatus);
router.post("/connect/login-link", protectRoute, vendorOnly, createLoginLink);

export default router;

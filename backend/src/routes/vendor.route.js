import { Router } from "express";
import {
    registerVendor,
    getVendorProfile,
    createVendorProduct,
    getVendorProducts,
    getVendorStats,
    updateVendorProduct,
    vendorSearch,
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
import { validate } from "../middleware/validate.middleware.js";
import {
    registerVendorSchema,
    createProductSchema,
    requestWithdrawalSchema,
} from "../lib/zod.js";

const router = Router();

router.post("/register", protectRoute, validate(registerVendorSchema), registerVendor);
router.get("/profile", protectRoute, vendorOnly, getVendorProfile);
router.get("/stats", protectRoute, vendorOnly, getVendorStats);
router.get("/products", protectRoute, vendorOnly, getVendorProducts);
router.post("/products", protectRoute, vendorOnly, upload.array("images", 3), validate(createProductSchema), createVendorProduct);
router.put("/products/:id", protectRoute, vendorOnly, upload.array("images", 3), validate(createProductSchema), updateVendorProduct);
router.post("/withdrawals", protectRoute, vendorOnly, validate(requestWithdrawalSchema), requestWithdrawal);
router.get("/withdrawals", protectRoute, vendorOnly, getVendorWithdrawals);
router.get("/search", protectRoute, vendorOnly, vendorSearch);

// Stripe Connect Routes
router.post("/connect/account", protectRoute, vendorOnly, createConnectAccount);
router.post("/connect/account-link", protectRoute, vendorOnly, createAccountLink);
router.get("/connect/status", protectRoute, vendorOnly, getConnectAccountStatus);
router.post("/connect/login-link", protectRoute, vendorOnly, createLoginLink);

export default router;

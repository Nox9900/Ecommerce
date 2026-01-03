import { Router } from "express";
import {
    registerVendor,
    getVendorProfile,
    createVendorProduct,
    getVendorProducts,
    getVendorStats,
} from "../controllers/vendor.controller.js";
import { protectRoute, vendorOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post("/register", protectRoute, registerVendor);
router.get("/profile", protectRoute, vendorOnly, getVendorProfile);
router.get("/stats", protectRoute, vendorOnly, getVendorStats);
router.get("/products", protectRoute, vendorOnly, getVendorProducts);
router.post("/products", protectRoute, vendorOnly, upload.array("images", 3), createVendorProduct);

export default router;

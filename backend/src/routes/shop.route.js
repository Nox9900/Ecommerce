import { Router } from "express";
import {
    createShop,
    getVendorShops,
    getShopById,
    getRandomShops,
    updateShop,
    deleteShop,
} from "../controllers/shop.controller.js";
import { protectRoute, vendorOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.get("/random", getRandomShops);
router.get("/:id", getShopById);

// Vendor routes
router.post(
    "/",
    protectRoute,
    vendorOnly,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    createShop
);
router.get("/", protectRoute, vendorOnly, getVendorShops);
router.patch(
    "/:id",
    protectRoute,
    vendorOnly,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    updateShop
);
router.delete("/:id", protectRoute, vendorOnly, deleteShop);

export default router;

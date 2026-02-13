import { Router } from "express";
import {
  createProduct,
  getAllCustomers,
  getAllOrders,
  getAllProducts,
  getDashboardStats,
  updateOrderStatus,
  updateProduct,
  deleteProduct,
  getAllVendors,
  updateVendorStatus,
  getSettings,
  updateSettings,
  deleteVendorRequest,
  getAllShops,
  searchAll,
} from "../controllers/admin.controller.js";
import {
  bulkDeleteProducts,
  bulkUpdateProductStock,
  bulkUpdateOrderStatus,
  bulkDeleteOrders,
} from "../controllers/bulk-operations.controller.js";
import {
  getAllWithdrawals,
  updateWithdrawalStatus
} from "../controllers/withdrawal.controller.js";

import { adminOnly, protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createProductSchema,
  settingsSchema,
  updateStatusSchema,
} from "../lib/zod.js";

const router = Router();

// optimization - DRY
router.use(protectRoute, adminOnly);

router.post("/products", upload.array("images", 3), validate(createProductSchema), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), validate(createProductSchema), updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/bulk-delete", bulkDeleteProducts);
router.post("/products/bulk-update-stock", bulkUpdateProductStock);
router.get("/shops", getAllShops);

router.get("/orders", getAllOrders);
router.post("/orders/bulk-status", bulkUpdateOrderStatus);
router.post("/orders/bulk-delete", bulkDeleteOrders);
router.patch("/orders/:orderId/status", validate(updateStatusSchema), updateOrderStatus);

router.get("/customers", getAllCustomers);

router.get("/vendors", getAllVendors);
router.patch("/vendors/:vendorId/status", validate(updateStatusSchema), updateVendorStatus);
router.delete("/vendors/:vendorId", deleteVendorRequest);

router.get("/settings", getSettings);
router.put("/settings", validate(settingsSchema), updateSettings);

router.get("/withdrawals", getAllWithdrawals);
router.patch("/withdrawals/:withdrawalId/status", validate(updateStatusSchema), updateWithdrawalStatus);

router.get("/stats", getDashboardStats);
router.get("/search", searchAll);

// PUT: Used for full resource replacement, updating the entire resource
// PATCH: Used for partial resource updates, updating a specific part of the resource

export default router;

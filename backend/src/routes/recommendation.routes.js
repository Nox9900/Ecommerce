import express from "express";
import {
    getFrequentlyBoughtTogether,
    getPersonalizedRecommendations,
    getTrendingProducts,
} from "../controllers/recommendation.controller.js";
import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";

const router = express.Router();

// Middleware to populate req.user if authenticated, but not block if not
const optionalAuth = async (req, res, next) => {
    try {
        // Clerk's requireAuth() throws if not authenticated? No, it's a middleware.
        // We can use req.auth from Clerk if available.
        // Since we don't have the clerk middleware applied globally, we need to inspect how it works.
        // However, for simplicity, let's just use the `protectRoute` logic but not return 401.

        // Actually, Clerk's `ClerkExpressRequireAuth` or similar is what `requireAuth()` returns.
        // If we want optional, we might need a different approach or just check headers manually?
        // Or we can just try to run the auth check.

        // Let's rely on `req.auth` if the global middleware sets it. 
        // If global middleware is not setting it, we need to add it.
        // Looking at `server.js` (I will check it next), usually Clerk middleware is global.
        // If it is, `req.auth` should be there.
        // If `req.auth.userId` exists, we fetch the user.

        if (req.auth && req.auth.userId) {
            const user = await User.findOne({ clerkId: req.auth.userId });
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        console.error("Optional auth error:", error);
        next();
    }
};

// Check if we need to apply Clerk middleware here:
// If server.js applies `ClerkExpressWithAuth` (loose) globally, we are good.
// If it applies nothing, we need to apply it.
// `requireAuth()` adheres to strict auth. 
// Use `ClerkExpressWithAuth()` for loose auth? 
// I'll check server.js first. For now, I'll write the routes without specific middleware 
// assuming I'll fix server.js to provide auth context globally or I'll come back.

// Update: I'll actually just use the controller's logic.
// The controller checks `req.user`. 
// So I need a middleware that populates `req.user`.
// I'll define a simple one here or import if I create one.
// Let's reuse the logic from `auth.middleware.js` but make it non-blocking.

router.get("/trending", getTrendingProducts);
router.get("/frequently-bought/:id", getFrequentlyBoughtTogether);
router.get("/personalized", optionalAuth, getPersonalizedRecommendations);

export default router;

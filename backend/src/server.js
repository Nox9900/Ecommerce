import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";
import http from "http";
import { functions, inngest } from "./config/inngest.js";

import { rateLimit } from "express-rate-limit"; // Added import
import helmet from "helmet";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import AppError from "./lib/AppError.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import categoryRoutes from "./routes/category.route.js";
import vendorRoutes from "./routes/vendor.route.js";
import chatRoutes from "./routes/chat.route.js";
import shopRoutes from "./routes/shop.route.js";
import promoBannerRoutes from "./routes/promoBanner.route.js";
import notificationRoutes from "./routes/notification.route.js";

const app = express();
app.use(helmet());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL, // Allow requests from client
    methods: ["GET", "POST"],
  },
});

app.set("io", io); // Make io available in routes

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User matched socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("joinUser", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const __dirname = path.resolve();
// special handling: Stripe webhook needs raw body BEFORE any body parsing middleware
// apply raw body parser conditionally only to webhook endpoint

app.use(
  "/api/payment",
  (req, res, next) => {
    if (req.originalUrl === "/api/payment/webhook") {
      express.raw({ type: "application/json" })(req, res, next);
    } else {
      express.json()(req, res, next); // parse json for non-webhook routes
    }
  },
  paymentRoutes
);

app.use(express.json());
app.use(clerkMiddleware()); // adds auth object under the req => req.auth
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // credentials: true allows the browser to send the cookies to the server with the request

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => {
  const adminDistPath = path.join(__dirname, "../admin/dist");
  res.sendFile(path.join(adminDistPath, "index.html"));
});

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/promo-banners", promoBannerRoutes);

// Helper for admin dist path
const adminDistPath = path.join(__dirname, "../admin/dist");

// Serve static files from the admin frontend app
app.use(express.static(adminDistPath));

// Handle undefined API routes
app.all("/api/(*)", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// For any other route, serve the index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(adminDistPath, "index.html"));
});

const startServer = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
};

startServer();

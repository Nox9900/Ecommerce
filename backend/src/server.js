import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";
import http from "http";
import { functions, inngest } from "./config/inngest.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import heroRoutes from "./routes/hero.route.js";
import categoryRoutes from "./routes/category.route.js";
import vendorRoutes from "./routes/vendor.route.js";
import chatRoutes from "./routes/chat.route.js";

const app = express();
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

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/chats", chatRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success inside the server nnow!!!! wooohhhhh" });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));
  app.get(/^(.*)$/, (req, res) => {
    res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
  });
}

const startServer = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
};

startServer();

<h1 align="center">✨ Full-Stack E-Commerce App (Mobile + Admin + API) ✨</h1>

✨ **Highlights:**

- 📱 E-Commerce Mobile App (Flutter)
- 🔐 Secure Authentication with Clerk (Google, Apple sign-in, Email and Phone Number)
- 🛒 Cart, Favorites, Checkout & Orders Flow
- 💳 Stripe-Powered Payments (not implemented yet)
- 🧑‍💻 Chat functionality
- 🗺️ Addresses System
- 🏪 Admin Dashboard — Products, Orders, Customers & Stats and much more
- ⚙️ Complete REST API (Node.js + Express) with Auth & Roles
- 🛂 Admin-Only Protected Routes
- 📦 Background Jobs with Inngest
- 🧭 Dashboard with Live Analytics
- 🛠️ Product Management (CRUD, image handling, pricing, etc.)
- 📦 Order Management
- 👥 Customer Management Page
- 🚀 Deployment on Sevalla (API + Admin Dashboard)
- 🖼️ Product Image Slider
- ⚡ Data Fetching & Caching with TanStack Query
- 🧰 End-to-End Git & GitHub Workflow (branches, commits, PRs, code reviews)
- 🤖 CodeRabbit PR Analysis (security, quality, optimization)


---
## 🧪 `.env` Setup

### 🟦 Backend (`/backend`)

```bash
NODE_ENV=development
PORT=3000

DB_URL=<YOUR_DB_URL>

CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>

INNGEST_SIGNING_KEY=<YOUR_INNGEST_SIGNING_KEY>

CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_API_SECRET>
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>

ADMIN_EMAIL=<YOUR_ADMIN_EMAIL>

CLIENT_URL=http://localhost:5173

STRIPE_PUBLISHABLE_KEY=<YOUR_STRIPE_PUBLISHABLE_KEY>
STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>

STRIPE_WEBHOOK_SECRET=<YOUR_STRIPE_WEBHOOK_SECRET>
```

---

### 🟩 Admin Dashboard (/admin)

```bash
VITE_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
VITE_API_URL=http://localhost:3000/api

```

---

### 🟧 Mobile App (/mobile)

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY= <YOUR_CLERK_PUBLISHABLE_KEY>
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<YOUR_STRIPE_PUBLISHABLE_KEY>
```

```
### 🏗️ Project Architecture
The project is a full-stack multi-vendor e-commerce platform divided into three main components:

Backend (/backend):

Framework: Node.js & Express.
Database: MongoDB (Mongoose).
Authentication: Managed by Clerk.
Payments: Stripe integration.
Real-time: Socket.io for the in-app chat system.
Admin Dashboard (/admin):

Tech Stack: Vite + React.
Roles: Super-Admins and Vendors.
Mobile App (/mobile):

Tech Stack: React Native + Expo.
Theme: Optimized with NativeWind (Tailwind).
Features: Comprehensive buyer journey: browsing, cart, wishlist, real-time chat, and secure checkout.
📦 Key Data Models
User: Profiles, addresses, and roles (customer, vendor, admin).
Vendor: Shop details, verification status, and earnings.
Product: Rich data with variants, categories, and vendor ownership.
Order: Multi-item transactions and shipping tracking.
Conversation & Message: Powers the real-time chat.
🛠️ Next Steps
Based on notes.md, there are several advanced features ready for implementation:

Enhanced Vendor Analytics
Split Payments (Stripe Connect)
AI-Powered Product Descriptions
Admin Dispute Resolution Tools
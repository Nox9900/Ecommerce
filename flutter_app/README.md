# Yaamaan Flutter App

A modern Flutter mobile app for the Yaamaan B2B wholesale marketplace, connected to the Django REST API backend.

## Features

- **Authentication** — Login & registration with token-based auth
- **Product Browsing** — Search, filter by category, paginated listings
- **Product Details** — Full product info with quantity selector
- **Shopping Cart** — Add/remove items, quantity controls, order summary
- **Checkout** — Shipping form, payment method selection, order placement
- **Order Tracking** — View orders, status progress bar, order details
- **User Profile** — View/edit profile, company info, logout

## Tech Stack

| Layer          | Tech                     |
|----------------|--------------------------|
| Framework      | Flutter 3.x              |
| State Mgmt     | Provider                 |
| HTTP Client    | http package             |
| Image Caching  | cached_network_image     |
| Fonts          | Google Fonts (Poppins)   |
| Design         | Material 3               |

## Project Structure

```
lib/
├── main.dart                # Entry point with Provider setup
├── app.dart                 # MaterialApp with route definitions
├── config/
│   ├── api_config.dart      # API endpoints & server URL
│   └── theme.dart           # App theme, colors, typography
├── models/
│   ├── product.dart
│   ├── category.dart
│   ├── user.dart
│   ├── order.dart
│   └── cart_item.dart
├── services/
│   └── api_service.dart     # HTTP client with auth & error handling
├── providers/
│   ├── auth_provider.dart   # Authentication state
│   ├── product_provider.dart# Products & categories
│   ├── cart_provider.dart   # Shopping cart
│   └── order_provider.dart  # Order management
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── products/
│   │   ├── products_screen.dart
│   │   └── product_detail_screen.dart
│   ├── cart/
│   │   ├── cart_screen.dart
│   │   └── checkout_screen.dart
│   ├── orders/
│   │   ├── orders_screen.dart
│   │   └── order_detail_screen.dart
│   └── profile/
│       └── profile_screen.dart
└── widgets/
    ├── product_card.dart
    ├── section_header.dart
    └── shimmer_loading.dart
```

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) 3.16+
- Android Studio / Xcode (for emulators)
- Django backend running (see parent project)

### Setup

1. **Install Flutter SDK** (if not installed):
   ```bash
   # Windows: Download from https://docs.flutter.dev/get-started/install/windows
   # macOS:   brew install flutter
   # Linux:   snap install flutter --classic
   ```

2. **Configure API URL** in `lib/config/api_config.dart`:
   ```dart
   // Android emulator → 10.0.2.2
   // iOS simulator   → 127.0.0.1
   // Physical device  → your LAN IP (e.g. 192.168.1.100)
   static const String baseUrl = 'http://10.0.2.2:8000';
   ```

3. **Install dependencies**:
   ```bash
   cd flutter_app
   flutter pub get
   ```

4. **Start the Django backend**:
   ```bash
   cd ..
   python manage.py runserver 0.0.0.0:8000
   ```

5. **Run the app**:
   ```bash
   flutter run
   # or for web:
   flutter run -d chrome
   ```

### Building for Production

```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

## API Connection

The app connects to these Django REST API endpoints:

| Feature         | Endpoint                    | Method   |
|-----------------|-----------------------------|----------|
| Login           | `/api/v1/auth/login/`       | POST     |
| Register        | `/api/v1/auth/register/`    | POST     |
| Profile         | `/api/v1/auth/profile/`     | GET/PUT  |
| Products        | `/api/v1/products/`         | GET      |
| Categories      | `/api/v1/categories/`       | GET      |
| Orders          | `/api/v1/orders/`           | GET/POST |
| Order Detail    | `/api/v1/orders/{id}/`      | GET      |
| Vendors         | `/api/v1/vendors/`          | GET      |
| Payments        | `/api/v1/payments/`         | GET      |
| Reviews         | `/api/v1/reviews/`          | GET/POST |
| Settings        | `/api/v1/settings/`         | GET      |

## Design System

- **Primary**: Navy Blue `#1E3A5F`
- **Accent**: Vibrant Orange `#FF6B35`
- **Success**: `#10B981`
- **Font**: Poppins (via Google Fonts)
- **Style**: Material 3 with rounded corners and subtle shadows

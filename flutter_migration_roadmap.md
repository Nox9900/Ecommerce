# Flutter Migration Roadmap: Replicating Expo Functionalities

This document outlines the necessary steps to ensure the Flutter application achieves parity with the existing Expo mobile application.

## 1. Screen Parity Mapping

| Feature / Screen | Expo Route (mobile/app) | Flutter Implementation Status | Action Needed |
| :--- | :--- | :--- | :--- |
| **Welcome/Onboarding** | `(auth)/welcome.tsx` | Partial (`welcome_screen.dart`) | Implement social auth buttons & design polish |
| **Email Sign In** | `(auth)/email-signin.tsx` | Partial (`email_signin_screen.dart`) | Add validation & error handling |
| **Email Sign Up** | `(auth)/email-signup.tsx` | Missing | Create `email_signup_screen.dart` |
| **Phone Sign In** | `(auth)/phone-signin.tsx` | Missing | Create `phone_signin_screen.dart` |
| **Phone Sign Up** | `(auth)/phone-signup.tsx` | Missing | Create `phone_signup_screen.dart` |
| **Forgot Password** | `(auth)/forgot-password.tsx` | Missing | Create `forgot_password_screen.dart` |
| **Home Screen** | `(tabs)/index.tsx` | Missing | Create `home_screen.dart` with banners, categories, and recommendations |
| **Cart** | `(tabs)/cart.tsx` | Missing | Create `cart_screen.dart` with checkout flow |
| **Profile** | `(tabs)/profile.tsx` | Partial (`profile_screen.dart`) | Add: Photo upload, Theme toggle, Font size, Language, Vendor portal link |
| **Product Details** | `product/[id].tsx` | Partial (`product_detail_screen.dart`) | Add: Reviews, Quantity picker, Related products |
| **Shop/Vendor** | `vendor/[id].tsx` | Partial (`shop_screen.dart`) | Sync naming convention & add vendor-specific details |
| **Chat List** | `(tabs)/chat.tsx` | Missing | Create `chat_list_screen.dart` |
| **Individual Chat** | `chat/[id].tsx` | Missing | Create `chat_screen.dart` with Socket.io integration |
| **Search** | `search.tsx` | Missing | Create `search_screen.dart` |
| **Subcategory** | `subcategory/[id].tsx` | Missing | Create `subcategory_screen.dart` |
| **Comparison** | `comparison.tsx` | Missing | Create `comparison_screen.dart` |
| **Wishlist** | `public-wishlist/[id].tsx` | Missing | Create `wishlist_screen.dart` |

## 2. Core Logic & State Management

### State Management (Replicating Contexts)
The Expo app uses React Context. In Flutter, we should continue using `Provider` (as seen in `pubspec.yaml`).

- **Auth State**: Ensure persistent login and session management.
- **Cart Context**: Create `CartProvider` to replicate `useCart.ts` logic (add/remove/update items).
- **Comparison Context**: Create `ComparisonProvider` to replicate `ComparisonContext.tsx`.
- **Notification Context**: Create `NotificationProvider` for push notifications.
- **Toast/UI Messages**: Use `ToastContext.tsx` equivalent (e.g., `fluttertoast` or custom snackbar logic).

### Services (Replicating `mobile/lib`)
- **API Client**: `api.ts` -> Already partially handled via `dio` in `flutter/lib/core`.
- **Cloudinary**: `cloudinary.ts` -> Implement image upload service in Flutter.
- **i18n (Internationalization)**: `i18n.ts` & `i18n-utils.ts` -> Use Flutter `localizations` or `easy_localization`.
- **Notifications**: `notifications.ts` -> Set up Firebase Messaging if applicable.
- **Theme**: `useTheme.ts` -> Use `ThemeData` and custom theme extensions in Flutter.

## 3. Missing Dependencies/Packages

Based on Expo's capabilities, we may need these additional Flutter packages:
- `firebase_messaging`: For push notifications.
- `fluttertoast`: For toast notifications.
- `url_launcher`: For opening external links.
- `image_picker`: For profile picture/chat uploads.
- `smooth_page_indicator`: For onboarding/banners.

## 4. Immediate Next Steps

1.  **Implement Home Screen**: The core of the app is missing a centralized home view.
2.  **Complete Auth Flow**: Add Sign Up and Forgot Password screens.
3.  **Cart System**: Implement the Cart provider and screen to enable purchasing.
4.  **Socket.io Integration**: Since `socket_io_client` is in `pubspec.yaml`, implement the chat service.

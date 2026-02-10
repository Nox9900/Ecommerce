# Wishlist Sharing Functionality

This document explains how the wishlist sharing feature works, both from a user perspective and a technical implementation standpoint.

## 1. Feature Overview

The wishlist sharing feature allows users to generate a unique, shareable link for their wishlist. When shared, anyone with the link can view the wishlist in a specialized read-only view, even if they are not logged in (depending on app implementation) or are a different user.

## 2. User User Flow

### Sharing a Wishlist
1.  **Navigate to Wishlist**: Go to the Profile tab and tap on "Wishlist".
2.  **Tap Share Icon**: In the top-right header, there is a share icon.
    -   **If Private**: The icon shows a lock (`lock-closed`). Tapping it prompts the user to "Make Public".
    -   **If Public**: The icon shows a share symbol (`share-social`).
3.  **Make Public**: Confirming "Make Public" generates a unique `wishlistToken` on the backend and sets `isWishlistPublic` to `true`.
4.  **Share Link**: Once public, tapping the share icon opens the native share sheet with a link format: `https://expo-ecommerce.com/wishlist/share/<token>`.
5.  **Make Private**: Users can revert their wishlist to private at any time, which invalidates the link for anyone trying to access it.

### Viewing a Shared Wishlist
1.  **Open Link**: When a user clicks the shared link, they are directed to the `PublicWishlistScreen` (e.g., via deep linking or navigation).
2.  **View Products**: The screen displays all products in the sharer's wishlist.
3.  **Interaction**: Viewers cannot remove items, but they can add products to their own cart.

## 3. Technical Implementation

### Backend

#### Database Schema (`User` Model)
New fields were added to the `User` schema in `user.model.js`:
-   `isWishlistPublic` (Boolean): Default `false`. Determines if the wishlist is accessible via token.
-   `wishlistToken` (String): A unique, sparse index token generated using `crypto.randomBytes`. This token is used in the URL instead of the user ID to prevent enumeration attacks.

#### API Endpoints (`user.controller.js`)
-   `PUT /api/users/wishlist/share`:
    -   Toggles `isWishlistPublic`.
    -   Generates a new `wishlistToken` if one doesn't exist and the user is enabling sharing.
    -   Returns the token and new status.
-   `GET /api/users/wishlist/share/:token`:
    -   Searches for a user with the matching `wishlistToken`.
    -   Checks if `isWishlistPublic` is true.
    -   Returns the wishlist products and the owner's name.
    -   Returns 404 if the token is invalid or the user has made their wishlist private.

### Frontend (Mobile)

#### State Management (`useWishlist.ts`)
-   **`useWishlist` Hook**: Updated to return `isWishlistPublic` and `wishlistToken` alongside the wishlist data.
-   **`useShareWishlist` Hook**: Handles the mutation to toggle privacy.
-   **`usePublicWishlist` Hook**: Fetches wishlist data using a token for the public view.

#### Components
-   **`WishlistScreen`**: Modified header to include the share button and logic for toggling privacy/sharing.
-   **`PublicWishlistScreen`**: A new screen designed for read-only access. It reuses product display logic but removes editing capabilities (like deleting items).

## 4. Security Considerations

-   **Token-Based Access**: We use a random hex token rather than the user's database ID. This makes it impossible for malicious users to guess wishlist URLs.
-   **Toggle Privacy**: Users have full control. Setting a wishlist to private immediately blocks access to the token, even if the link was previously shared.

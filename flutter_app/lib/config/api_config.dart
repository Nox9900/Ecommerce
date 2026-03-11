/// API configuration for connecting to the Node.js/Express backend.
class ApiConfig {
  static const String _baseUrl = 'https://yaamaan.sevalla.app/';

  /// Clerk publishable key – used to derive the Frontend API URL.
  /// Replace with your actual key from the Clerk dashboard.
  static const String clerkPublishableKey =
      'pk_test_c2hhcmluZy1jb2x0LTgwLmNsZXJrLmFjY291bnRzLmRldiQ';

  /// Google **Web** Client ID – used as `serverClientId` on Android
  /// and `clientId` on iOS / Web.
  static const String googleWebClientId =
      '130497762386-l5la7fgk2bl9chc2ktn17u6211soj774.apps.googleusercontent.com';

  static String get baseUrl => _baseUrl;

  static String get apiBase => '$baseUrl/api';

  // --------------- Auth ---------------
  static String get googleSignIn => '$apiBase/auth/google';
  static String get register => '$apiBase/auth/register';
  static String get login => '$apiBase/auth/login';
  static String get forgotPassword => '$apiBase/auth/forgot-password';

  // --------------- Users ---------------
  static String get me => '$apiBase/users/me';
  static String get addresses => '$apiBase/users/addresses';
  static String address(String id) => '$apiBase/users/addresses/$id';
  static String get wishlist => '$apiBase/users/wishlist';
  static String wishlistRemove(String productId) =>
      '$apiBase/users/wishlist/$productId';
  static String get wishlistShare => '$apiBase/users/wishlist/share';
  static String wishlistPublic(String token) =>
      '$apiBase/users/wishlist/share/$token';
  static String get pushToken => '$apiBase/users/push-token';

  // --------------- Products ---------------
  static String get products => '$apiBase/products';
  static String product(String id) => '$apiBase/products/$id';

  // --------------- Categories ---------------
  static String get categories => '$apiBase/categories';

  // --------------- Cart (server-side) ---------------
  static String get cart => '$apiBase/cart';
  static String cartItem(String productId) => '$apiBase/cart/$productId';
  static String get cartCoupon => '$apiBase/cart/coupon';

  // --------------- Orders ---------------
  static String get orders => '$apiBase/orders';

  // --------------- Reviews ---------------
  static String get reviews => '$apiBase/reviews';
  static String productReviews(String productId) =>
      '$apiBase/reviews/product/$productId';

  // --------------- Vendors ---------------
  static String get vendors => '$apiBase/vendors';
  static String vendor(String id) => '$apiBase/vendors/$id';
  static String get vendorSearch => '$apiBase/vendors/search';

  // --------------- Shops ---------------
  static String get shops => '$apiBase/shops';
  static String get randomShops => '$apiBase/shops/random';
  static String shop(String id) => '$apiBase/shops/$id';

  // --------------- Payments ---------------
  static String get createPaymentIntent => '$apiBase/payment/create-intent';

  // --------------- Promo Banners ---------------
  static String get promoBanners => '$apiBase/promo-banners';

  // --------------- Notifications ---------------
  static String get notifications => '$apiBase/notifications';
  static String get unreadNotifications => '$apiBase/notifications/unread';
  static String notificationRead(String id) =>
      '$apiBase/notifications/$id/read';
  static String get notificationsReadAll => '$apiBase/notifications/read-all';

  // --------------- Chat ---------------
  static String get conversations => '$apiBase/chats';
  static String get unreadMessageCount => '$apiBase/chats/unread-count';
  static String conversationMessages(String id) =>
      '$apiBase/chats/$id/messages';
  static String conversationRead(String id) => '$apiBase/chats/$id/read';
  static String get sendMessage => '$apiBase/chats/message';
  static String get startConversation => '$apiBase/chats';

  // --------------- Recommendations ---------------
  static String get trendingProducts => '$apiBase/recommendations/trending';
  static String frequentlyBought(String id) =>
      '$apiBase/recommendations/frequently-bought/$id';
  static String get personalizedRecommendations =>
      '$apiBase/recommendations/personalized';

  // --------------- Delivery ---------------
  static String deliveryInfo(String orderId) => '$apiBase/delivery/$orderId';

  static const int pageSize = 20;
}

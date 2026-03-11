import 'package:flutter/foundation.dart' show kIsWeb;

/// API configuration for connecting to the Yaamaan Django backend.
/// Change [_lanIp] to your PC's local network IP when testing on a phone.
class ApiConfig {
  static const String _lanIp = '192.168.100.187';

  static String get baseUrl {
    // When running on a phone browser or emulator, use the LAN IP.
    // On desktop browsers, localhost works fine.
    if (kIsWeb) {
      // If the browser itself is on the LAN (phone), the page URL won't be localhost.
      // We route through the LAN IP so it works from any device on the network.
      return 'http://$_lanIp:8000';
    }
    return 'http://$_lanIp:8000'; // native mobile
  }

  static String get apiBase => '$baseUrl/api/v1';

  // Auth
  static String get login => '$apiBase/auth/login/';
  static String get logout => '$apiBase/auth/logout/';
  static String get register => '$apiBase/auth/register/';
  static String get profile => '$apiBase/auth/profile/';

  // Resources
  static String get products => '$apiBase/products/';
  static String get featuredProducts => '$apiBase/products/featured/';
  static String get categories => '$apiBase/categories/';
  static String get orders => '$apiBase/orders/';
  static String get vendors => '$apiBase/vendors/';
  static String get payments => '$apiBase/payments/';
  static String get reviews => '$apiBase/reviews/';
  static String get quotes => '$apiBase/quotes/';
  static String get settings => '$apiBase/settings/';
  static String get banners => '$apiBase/banners/';
  static String get dashboard => '$apiBase/dashboard/';
  static String get searchSuggestions => '$apiBase/search-suggestions/';

  static const int pageSize = 20;
}

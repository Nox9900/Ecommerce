/// Environment configuration for the app.
/// Change these values per environment (dev/staging/production).
class Env {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://yaamaan.sevalla.app/api',
  );

  static String get socketUrl => apiBaseUrl.replaceAll('/api', '');

  static const String clerkPublishableKey = String.fromEnvironment(
    'CLERK_PUBLISHABLE_KEY',
    defaultValue: 'pk_test_c2hhcmluZy1jb2x0LTgwLmNsZXJrLmFjY291bnRzLmRldiQ',
  );

  static const String stripePublishableKey = String.fromEnvironment(
    'STRIPE_PUBLISHABLE_KEY',
    defaultValue: 'pk_test_51SiR1qBpUIJTPr5DYHtTTzOg6fBjjIy76KidZlS0dibNSIXvpjVYM8ujcCqgwzhhrtGWuUvFN9vCIbSxpz0aAR5E00hcJFcscI',
  );

  static const String googleClientId = String.fromEnvironment(
    'GOOGLE_CLIENT_ID',
    defaultValue: '',
  );
}

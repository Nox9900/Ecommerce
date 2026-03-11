import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'services/api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/order_provider.dart';
import 'providers/vendor_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final api = ApiService();
  final auth = AuthProvider(api);
  final cart = CartProvider()..setApi(api);

  // Auto-logout on 401 responses
  api.onUnauthorized = () => auth.logout();

  // Restore persisted auth token before first frame
  await auth.init();

  // If the user is logged in, fetch their server-side cart
  if (auth.isLoggedIn) {
    await cart.fetchCart();
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
        ChangeNotifierProvider(create: (_) => ProductProvider(api)),
        ChangeNotifierProvider.value(value: cart),
        ChangeNotifierProvider(create: (_) => OrderProvider(api)),
        ChangeNotifierProvider(create: (_) => VendorProvider(api)),
      ],
      child: const YaamaanApp(),
    ),
  );
}

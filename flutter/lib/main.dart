import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/providers/shop_provider.dart';
import 'package:flutter_mobile_app/providers/auth_provider.dart';
import 'package:flutter_mobile_app/providers/cart_provider.dart';
import 'package:flutter_mobile_app/providers/chat_provider.dart';
import 'package:flutter_mobile_app/providers/theme_provider.dart';
import 'package:flutter_mobile_app/providers/wishlist_provider.dart';
import 'package:flutter_mobile_app/widgets/main_navigation.dart';
import 'package:flutter_mobile_app/screens/welcome_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>(
          create: (_) => ApiClient(),
        ),
        ChangeNotifierProxyProvider<ApiClient, AuthProvider>(
          create: (context) => AuthProvider(context.read<ApiClient>()),
          update: (context, apiClient, authProvider) => authProvider ?? AuthProvider(apiClient),
        ),
        ChangeNotifierProxyProvider<ApiClient, ShopProvider>(
          create: (context) => ShopProvider(context.read<ApiClient>()),
          update: (context, apiClient, shopProvider) => shopProvider ?? ShopProvider(apiClient),
        ),
        ChangeNotifierProvider<CartProvider>(
          create: (_) => CartProvider(),
        ),
        ChangeNotifierProvider<ChatProvider>(
          create: (_) => ChatProvider(),
        ),
        ChangeNotifierProvider<ThemeProvider>(
          create: (_) => ThemeProvider(),
        ),
        ChangeNotifierProvider<WishlistProvider>(
          create: (_) => WishlistProvider(),
        ),
      ],
      child: const MainApp(),
    ),
  );
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    return MaterialApp(
      title: 'YAAMAAN',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      debugShowCheckedModeBanner: false,
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isAuthenticated) {
            return const MainNavigation();
          }
          return const WelcomeScreen();
        },
      ),
    );
  }
}

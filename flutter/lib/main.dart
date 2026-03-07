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

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  bool _providersInitialized = false;
  String? _lastToken;

  void _initProviders(BuildContext context, AuthProvider auth) {
    final token = auth.token;
    // Only re-init when auth state actually changes
    if (_providersInitialized && _lastToken == token) return;

    final apiClient = context.read<ApiClient>();
    final isAuth = auth.isAuthenticated;

    context.read<CartProvider>().init(apiClient, isAuthenticated: isAuth);
    context.read<WishlistProvider>().init(apiClient, isAuthenticated: isAuth);
    context.read<ChatProvider>().init(
      apiClient,
      token: token,
      userId: auth.user?.id,
    );

    _providersInitialized = true;
    _lastToken = token;
  }

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
          if (auth.isLoading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          _initProviders(context, auth);

          if (auth.isAuthenticated) {
            return const MainNavigation();
          }
          return const WelcomeScreen();
        },
      ),
    );
  }
}

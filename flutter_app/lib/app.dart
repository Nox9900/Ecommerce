import 'package:flutter/material.dart';
import 'config/theme.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/products/products_screen.dart';
import 'screens/products/product_detail_screen.dart';
import 'screens/vendors/vendors_screen.dart';
import 'screens/vendors/vendor_detail_screen.dart';
import 'screens/cart/cart_screen.dart';
import 'screens/cart/checkout_screen.dart';
import 'screens/orders/orders_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/sign_in_screen.dart';
import 'screens/auth/sign_up_screen.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';

class YaamaanApp extends StatelessWidget {
  const YaamaanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Yaamaan',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const SplashScreen(),
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/':
            return MaterialPageRoute(builder: (_) => const HomeScreen());
          case '/products':
            return MaterialPageRoute(builder: (_) => const ProductsScreen());
          case '/product-detail':
            final id = settings.arguments as String;
            return MaterialPageRoute(
                builder: (_) => ProductDetailScreen(productId: id));
          case '/vendors':
            return MaterialPageRoute(builder: (_) => const VendorsScreen());
          case '/vendor-detail':
            final id = settings.arguments as String;
            return MaterialPageRoute(
                builder: (_) => VendorDetailScreen(vendorId: id));
          case '/cart':
            return MaterialPageRoute(builder: (_) => const CartScreen());
          case '/checkout':
            return MaterialPageRoute(builder: (_) => const CheckoutScreen());
          case '/orders':
            return MaterialPageRoute(builder: (_) => const OrdersScreen());
          case '/login':
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case '/sign-in':
            return MaterialPageRoute(builder: (_) => const SignInScreen());
          case '/sign-up':
            return MaterialPageRoute(builder: (_) => const SignUpScreen());
          case '/forgot-password':
            return MaterialPageRoute(
                builder: (_) => const ForgotPasswordScreen());
          case '/profile':
            return MaterialPageRoute(builder: (_) => const ProfileScreen());
          case '/edit-profile':
            return MaterialPageRoute(
                builder: (_) => const EditProfileScreen());
          default:
            return MaterialPageRoute(builder: (_) => const HomeScreen());
        }
      },
    );
  }
}

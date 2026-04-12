import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';
import 'email_signin_screen.dart';
import 'email_signup_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              const Spacer(),
              
              // Premium Illustration/Logo Area
              Center(
                child: Column(
                  children: [
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryDefault,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: AppTheme.softShadow,
                      ),
                      child: const Icon(
                        Icons.shopping_bag_outlined,
                        size: 48,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      "Welcome to Shop",
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontSize: 32,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      "Your premium destination for \ncurated fashion and lifestyle.",
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppTheme.textSecondary,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              
              const Spacer(),

              // Auth Options Container
              Container(
                padding: const EdgeInsets.all(4),
                child: Column(
                  children: [
                    // Google Sign In
                    _buildAuthButton(
                      context,
                      icon: Icons.g_mobiledata,
                      label: 'Continue with Google',
                      onPressed: () => _handleGoogleSignIn(context),
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.textPrimary,
                      showBorder: true,
                    ),
                    const SizedBox(height: 12),

                    // Apple Sign In
                    _buildAuthButton(
                      context,
                      icon: Icons.apple,
                      label: 'Continue with Apple',
                      onPressed: () => _handleAppleSignIn(context),
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                    ),
                    const SizedBox(height: 12),

                    // Email Sign In (Primary)
                    _buildAuthButton(
                      context,
                      icon: Icons.email_outlined,
                      label: 'Continue with Email',
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const EmailSignInScreen()),
                        );
                      },
                      backgroundColor: AppTheme.primaryDefault,
                      foregroundColor: Colors.white,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),

              // Bottom Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Don't have an account? ",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const EmailSignUpScreen()),
                      );
                    },
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      "Sign Up",
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppTheme.primaryDefault,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),

              // Legal text
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  "By continuing, you agree to our Terms of Service and Privacy Policy.",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textMuted,
                    fontSize: 11,
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _handleGoogleSignIn(BuildContext context) async {
    await context.read<AuthProvider>().signInWithGoogle();
    if (context.mounted) {
      _checkAuthError(context);
    }
  }

  void _handleAppleSignIn(BuildContext context) async {
    await context.read<AuthProvider>().signInWithApple();
    if (context.mounted) {
      _checkAuthError(context);
    }
  }

  void _checkAuthError(BuildContext context) {
    final error = context.read<AuthProvider>().error;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      context.read<AuthProvider>().clearError();
    }
  }

  Widget _buildAuthButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    required Color backgroundColor,
    required Color foregroundColor,
    bool showBorder = false,
  }) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: foregroundColor,
          elevation: 0,
          side: showBorder ? const BorderSide(color: AppTheme.borderColor) : BorderSide.none,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, size: 24),
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

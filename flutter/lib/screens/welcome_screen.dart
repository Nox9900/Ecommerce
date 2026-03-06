import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../core/theme.dart';
import 'email_signin_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Placeholder for auth image
              Container(
                height: 300,
                width: 300,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.shopping_bag_outlined, size: 100, color: Colors.grey),
              ),
              const SizedBox(height: 48),
              
              // Google Sign In Button
              _buildAuthButton(
                context,
                icon: Icons.g_mobiledata,
                label: 'Continue with Google',
                onPressed: () {},
                isPrimary: false,
              ),
              const SizedBox(height: 12),

              // Email Sign In Button
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
                isPrimary: true,
              ),
              const SizedBox(height: 12),

              // Phone Sign In Button
              _buildAuthButton(
                context,
                icon: Icons.phone_android,
                label: 'Continue with Phone',
                onPressed: () {},
                isPrimary: false,
              ),
              const SizedBox(height: 24),

              // Sign Up Row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account? ", style: TextStyle(color: AppTheme.textSecondary)),
                  GestureDetector(
                    onTap: () {},
                    child: const Text(
                      "Sign Up",
                      style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),

              // Footer Text
              const Text(
                "By signing up, you agree to our Terms, Privacy Policy, and Cookie Use",
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAuthButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    bool isPrimary = true,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        icon: Icon(icon, color: isPrimary ? Colors.white : AppTheme.textPrimary),
        label: Text(label),
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isPrimary ? AppTheme.primaryDefault : Colors.white,
          foregroundColor: isPrimary ? Colors.white : AppTheme.textPrimary,
          elevation: 0,
          side: isPrimary ? BorderSide.none : const BorderSide(color: AppTheme.borderColor),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}

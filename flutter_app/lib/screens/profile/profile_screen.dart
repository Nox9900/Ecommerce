import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (!auth.isLoggedIn) {
      return _loginPrompt(context);
    }

    final user = auth.user!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppTheme.white,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // ── Avatar card ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: AppTheme.heroGradient,
                borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                boxShadow: AppTheme.shadowLg,
              ),
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.shadowMd,
                    ),
                    child: Center(
                      child: Text(
                        user.initials,
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user.displayName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user.email,
                    style: TextStyle(
                      color: Colors.white.withAlpha(180),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '@${user.username}',
                    style: TextStyle(
                      color: Colors.white.withAlpha(140),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Menu Items ──
            _section('Account'),
            _menuItem(
              Icons.person_outline_rounded,
              'Edit Profile',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const EditProfileScreen()),
                );
              },
            ),
            _menuItem(
              Icons.lock_outline_rounded,
              'Change Password',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Coming soon')),
                );
              },
            ),
            _menuItem(
              Icons.location_on_outlined,
              'Shipping Addresses',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Coming soon')),
                );
              },
            ),
            const SizedBox(height: 16),

            _section('Orders'),
            _menuItem(
              Icons.receipt_long_outlined,
              'Order History',
              onTap: () => Navigator.pushNamed(context, '/orders'),
            ),
            _menuItem(
              Icons.favorite_outline_rounded,
              'Wishlist',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Coming soon')),
                );
              },
            ),
            const SizedBox(height: 16),

            _section('Support'),
            _menuItem(
              Icons.help_outline_rounded,
              'Help Center',
              onTap: () {
                launchUrl(Uri.parse('https://yaamaan.com/help/'));
              },
            ),
            _menuItem(
              Icons.chat_bubble_outline_rounded,
              'Contact Us',
              onTap: () {
                launchUrl(Uri.parse('mailto:support@yaamaan.com'));
              },
            ),
            _menuItem(
              Icons.info_outline_rounded,
              'About',
              onTap: () {
                showAboutDialog(
                  context: context,
                  applicationName: 'Yaamaan',
                  applicationVersion: 'v1.0.0',
                  applicationLegalese: '\u00a9 2026 Yaamaan Global B2B Marketplace',
                );
              },
            ),
            const SizedBox(height: 16),

            // Logout
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Sign Out?'),
                      content: const Text(
                          'Are you sure you want to sign out?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () {
                            auth.logout();
                            Navigator.pop(ctx);
                          },
                          child: const Text('Sign Out',
                              style: TextStyle(color: AppTheme.error)),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.logout_rounded,
                    size: 18, color: AppTheme.error),
                label: const Text('Sign Out',
                    style: TextStyle(color: AppTheme.error)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.error),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusMd),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Version
            const Text(
              'Yaamaan v1.0.0',
              style: TextStyle(fontSize: 11, color: AppTheme.textHint),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _loginPrompt(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.person_outline_rounded,
                size: 40, color: AppTheme.textHint.withAlpha(80)),
          ),
          const SizedBox(height: 16),
          const Text(
            'Sign in to your account',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Manage your profile, orders and more',
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
            icon: const Icon(Icons.login_rounded, size: 18),
            label: const Text('Sign In'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(
                  horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusFull),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _section(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _menuItem(IconData icon, String label,
      {VoidCallback? onTap, String? trailing}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppTheme.border),
      ),
      child: ListTile(
        onTap: onTap,
        dense: true,
        leading: Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            color: AppTheme.primary.withAlpha(12),
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          ),
          child: Icon(icon, size: 18, color: AppTheme.primary),
        ),
        title: Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
        ),
        trailing: trailing != null
            ? Text(trailing,
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textSecondary))
            : const Icon(Icons.chevron_right_rounded,
                size: 18, color: AppTheme.textHint),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
      ),
    );
  }
}

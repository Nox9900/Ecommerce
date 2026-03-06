import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../core/theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            // User Info
            CircleAvatar(
              radius: 50,
              backgroundColor: AppTheme.primaryDefault.withOpacity(0.1),
              child: const Icon(Icons.person, size: 50, color: AppTheme.primaryDefault),
            ),
            const SizedBox(height: 16),
            Text(
              user?['name'] ?? 'User Name',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              user?['email'] ?? 'user@example.com',
              style: const TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 32),

            // Profile Options
            _buildOption(context, icon: Icons.shopping_bag_outlined, label: 'My Orders'),
            _buildOption(context, icon: Icons.favorite_border, label: 'Wishlist'),
            _buildOption(context, icon: Icons.location_on_outlined, label: 'Addresses'),
            _buildOption(context, icon: Icons.payment_outlined, label: 'Payment Methods'),
            const Divider(height: 40),
            _buildOption(
              context, 
              icon: Icons.logout, 
              label: 'Logout', 
              color: Colors.red,
              onTap: () {
                context.read<AuthProvider>().logout();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOption(BuildContext context, {
    required IconData icon, 
    required String label, 
    Color? color,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppTheme.textPrimary),
      title: Text(label, style: TextStyle(color: color ?? AppTheme.textPrimary, fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right, size: 20),
      onTap: onTap ?? () {},
    );
  }
}

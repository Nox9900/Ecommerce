import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_mobile_app/providers/auth_provider.dart';
import 'package:flutter_mobile_app/providers/theme_provider.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/screens/wishlist_screen.dart';
import 'package:flutter_mobile_app/screens/orders_screen.dart';
import 'package:flutter_mobile_app/screens/addresses_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;
    final themeProvider = context.watch<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.bold)),
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
            Stack(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: AppTheme.primaryDefault.withOpacity(0.1),
                  child: user?.imageUrl.isNotEmpty == true
                      ? ClipOval(
                          child: CachedNetworkImage(
                            imageUrl: user!.imageUrl,
                            width: 100,
                            height: 100,
                            fit: BoxFit.cover,
                            placeholder: (_, _) => const Icon(Icons.person, size: 50, color: AppTheme.primaryDefault),
                            errorWidget: (_, _, _) => const Icon(Icons.person, size: 50, color: AppTheme.primaryDefault),
                          ),
                        )
                      : const Icon(Icons.person, size: 50, color: AppTheme.primaryDefault),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppTheme.primaryDefault, shape: BoxShape.circle),
                    child: const Icon(Icons.edit, size: 16, color: Colors.white),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              user?.name ?? 'User Name',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              user?.email ?? 'user@example.com',
              style: const TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 32),

            // Profile Options
            _buildOption(
              context,
              icon: Icons.shopping_bag_outlined,
              label: 'My Orders',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const OrdersScreen()),
                );
              },
            ),
            _buildOption(
              context, 
              icon: Icons.favorite_border, 
              label: 'Wishlist',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const WishlistScreen()),
                );
              },
            ),
            _buildOption(
              context,
              icon: Icons.location_on_outlined,
              label: 'Addresses',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddressesScreen()),
                );
              },
            ),
            _buildOption(context, icon: Icons.payment_outlined, label: 'Payment Methods'),
            
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Divider(),
            ),
            
            // Settings
            _buildOption(
              context, 
              icon: Icons.dark_mode_outlined, 
              label: 'Dark Mode',
              trailing: Switch(
                value: themeProvider.themeMode == ThemeMode.dark,
                onChanged: (value) => themeProvider.toggleTheme(value),
                activeThumbColor: AppTheme.primaryDefault,
              ),
            ),
            _buildOption(
              context, 
              icon: Icons.language_outlined, 
              label: 'Language',
              trailing: const Text('English', style: TextStyle(color: AppTheme.textMuted)),
            ),
            
            if (user?.isVendor == true)
              _buildOption(
                context, 
                icon: Icons.store_outlined, 
                label: 'Vendor Portal',
                onTap: () {
                  // TODO: Navigate to Vendor dashboard
                },
              ),

            const Divider(height: 48, indent: 16, endIndent: 16),
            
            _buildOption(
              context, 
              icon: Icons.logout, 
              label: 'Logout', 
              color: Colors.red,
              onTap: () {
                context.read<AuthProvider>().logout();
              },
            ),
            const SizedBox(height: 40),
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
    Widget? trailing,
  }) {
    return ListTile(
      leading: Icon(icon, color: color ?? Theme.of(context).iconTheme.color),
      title: Text(label, style: TextStyle(color: color ?? Theme.of(context).textTheme.bodyLarge?.color, fontWeight: FontWeight.w500)),
      trailing: trailing ?? const Icon(Icons.chevron_right, size: 20),
      onTap: onTap ?? () {},
    );
  }
}

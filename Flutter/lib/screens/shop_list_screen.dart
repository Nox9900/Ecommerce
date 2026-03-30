import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/providers/shop_provider.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/screens/shop_detail_screen.dart';
import 'package:flutter_mobile_app/widgets/product_section.dart'; // For potential future use

class ShopListScreen extends StatefulWidget {
  const ShopListScreen({super.key});

  @override
  State<ShopListScreen> createState() => _ShopListScreenState();
}

class _ShopListScreenState extends State<ShopListScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final shopProvider = context.watch<ShopProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => shopProvider.fetchRandomShops(),
        child: CustomScrollView(
          slivers: [
            // Modern Sliver App Bar
            SliverAppBar(
              expandedHeight: 160,
              collapsedHeight: 80,
              pinned: true,
              elevation: 0,
              backgroundColor: theme.scaffoldBackgroundColor,
              surfaceTintColor: Colors.transparent,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.tune_rounded),
                  onPressed: () {},
                ),
                const SizedBox(width: 8),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 80, 20, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        'Discover local',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: AppTheme.textMuted,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      Text(
                        'Premium Shops',
                        style: theme.textTheme.displayLarge?.copyWith(
                          fontSize: 28,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Sticky Search Bar
            SliverPersistentHeader(
              pinned: true,
              delegate: _ShopSearchHeaderDelegate(controller: _searchController),
            ),

            // Shop Grid
            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: shopProvider.isLoading && shopProvider.randomShops.isEmpty
                  ? const SliverFillRemaining(
                      child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : shopProvider.randomShops.isEmpty
                      ? SliverFillRemaining(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.storefront_outlined, size: 64, color: Colors.grey[300]),
                                const SizedBox(height: 16),
                                Text('No shops found nearby', style: TextStyle(color: Colors.grey[500])),
                              ],
                            ),
                          ),
                        )
                      : SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 20,
                            crossAxisSpacing: 20,
                            childAspectRatio: 0.7,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final shop = shopProvider.randomShops[index];
                              return _ShopPremiumCard(shop: shop);
                            },
                            childCount: shopProvider.randomShops.length,
                          ),
                        ),
            ),
            
            // Bottom Spacer
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }
}

class _ShopSearchHeaderDelegate extends SliverPersistentHeaderDelegate {
  final TextEditingController controller;
  _ShopSearchHeaderDelegate({required this.controller});

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    final theme = Theme.of(context);
    return Container(
      color: theme.scaffoldBackgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          color: theme.brightness == Brightness.dark ? Colors.grey[900] : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppTheme.softShadow,
        ),
        child: TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: 'Search shops, categories...',
            hintStyle: TextStyle(color: Colors.grey[500], fontSize: 15),
            prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey),
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 15),
          ),
        ),
      ),
    );
  }

  @override
  double get maxExtent => 74;
  @override
  double get minExtent => 74;
  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => false;
}

class _ShopPremiumCard extends StatelessWidget {
  final dynamic shop;
  const _ShopPremiumCard({required this.shop});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => ShopDetailScreen(shop: shop)),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(24),
          boxShadow: AppTheme.softShadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Banner Area
                  Expanded(
                    flex: 40,
                    child: shop.bannerUrl.isNotEmpty
                        ? Image.network(shop.bannerUrl, fit: BoxFit.cover)
                        : Container(color: Colors.grey[100], child: const Icon(Icons.image_outlined, color: Colors.grey)),
                  ),
                  // Content Area
                  Expanded(
                    flex: 60,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(12, 30, 12, 12),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            children: [
                              Text(
                                shop.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold, 
                                  fontSize: 14,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Verified Vendor',
                                style: TextStyle(
                                  color: AppTheme.accentIndigo, 
                                  fontSize: 9, 
                                  fontWeight: FontWeight.bold, 
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.brightness == Brightness.dark ? Colors.white : AppTheme.primaryDefault,
                              foregroundColor: theme.brightness == Brightness.dark ? Colors.black : Colors.white,
                              elevation: 0,
                              minimumSize: const Size.fromHeight(38),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Visit Shop', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              // Logo overlapping the border
              Positioned(
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                child: Column(
                  children: [
                    const Expanded(flex: 40, child: SizedBox()),
                    Transform.translate(
                      offset: const Offset(0, -25),
                      child: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: AppTheme.softShadow,
                          image: shop.logoUrl.isNotEmpty 
                            ? DecorationImage(image: NetworkImage(shop.logoUrl), fit: BoxFit.cover)
                            : null,
                        ),
                        child: shop.logoUrl.isEmpty ? const Icon(Icons.storefront_rounded, color: Colors.grey) : null,
                      ),
                    ),
                    const Expanded(flex: 60, child: SizedBox()),
                  ],
                ),
              ),
              // Favorite Button
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.favorite_border_rounded, size: 16, color: AppTheme.accentRose),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

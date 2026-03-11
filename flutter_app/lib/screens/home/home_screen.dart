import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/vendor_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/section_header.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/vendor_card.dart';
import '../products/products_screen.dart';
import '../products/product_detail_screen.dart';
import '../cart/cart_screen.dart';
import '../orders/orders_screen.dart';
import '../profile/profile_screen.dart';
import '../vendors/vendors_screen.dart';
import '../vendors/vendor_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _navIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final pp = context.read<ProductProvider>();
      pp.fetchCategories();
      pp.fetchFeaturedProducts();
      pp.fetchBanners();
      pp.fetchProducts(refresh: true);
      context.read<VendorProvider>().fetchVendors();
    });
  }

  @override
  Widget build(BuildContext context) {
    final cartCount = context.watch<CartProvider>().totalQuantity;

    final screens = [
      const _HomeTab(),
      const ProductsScreen(embedded: true),
      const OrdersScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _navIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(12),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
            child: Row(
              children: [
                _navItem(Icons.home_rounded, Icons.home_outlined, 'Home', 0),
                _navItem(Icons.grid_view_rounded, Icons.grid_view, 'Products', 1),
                _cartNavItem(cartCount),
                _navItem(Icons.receipt_long_rounded,
                    Icons.receipt_long_outlined, 'Orders', 2),
                _navItem(Icons.person_rounded, Icons.person_outline, 'Profile', 3),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(
      IconData activeIcon, IconData icon, String label, int index) {
    final active = _navIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _navIndex = index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: active ? AppTheme.primary.withAlpha(20) : Colors.transparent,
                borderRadius: BorderRadius.circular(AppTheme.radiusFull),
              ),
              child: Icon(
                active ? activeIcon : icon,
                size: 24,
                color: active ? AppTheme.primary : AppTheme.textHint,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                color: active ? AppTheme.primary : AppTheme.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _cartNavItem(int count) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CartScreen()),
          );
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                boxShadow: AppTheme.shadowMd,
              ),
              child: badges.Badge(
                showBadge: count > 0,
                badgeContent: Text(
                  '$count',
                  style: const TextStyle(color: Colors.white, fontSize: 9),
                ),
                badgeStyle: const badges.BadgeStyle(
                  badgeColor: AppTheme.accent,
                  padding: EdgeInsets.all(4),
                ),
                child: const Icon(Icons.shopping_cart_rounded,
                    color: Colors.white, size: 20),
              ),
            ),
            const SizedBox(height: 2),
            const Text(
              'Cart',
              style: TextStyle(fontSize: 10, color: AppTheme.textHint),
            ),
          ],
        ),
      ),
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  HOME TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  final _bannerController = PageController(viewportFraction: 1.0);
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _autoScrollTimer?.cancel();
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!_bannerController.hasClients) return;
      final pp = context.read<ProductProvider>();
      if (pp.banners.isEmpty) return;
      final next = ((_bannerController.page?.round() ?? 0) + 1) % pp.banners.length;
      _bannerController.animateToPage(
        next,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _bannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final pp = context.watch<ProductProvider>();
    final vp = context.watch<VendorProvider>();
    final width = MediaQuery.of(context).size.width;
    final isWide = width > 700;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            pp.fetchFeaturedProducts(),
            pp.fetchCategories(),
            pp.fetchBanners(),
            vp.fetchVendors(),
          ]);
        },
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    // Logo
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.storefront_rounded,
                          size: 22, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            auth.isLoggedIn
                                ? 'Hello, ${auth.user?.displayName ?? 'Guest'}'
                                : 'Welcome to Yaamaan',
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const Text(
                            'B2B Global Marketplace',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined),
                      onPressed: () {},
                      style: IconButton.styleFrom(
                        backgroundColor: AppTheme.surfaceVariant,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Search Bar ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            const ProductsScreen(autoFocusSearch: true),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.search_rounded,
                            color: AppTheme.textHint, size: 20),
                        SizedBox(width: 10),
                        Text(
                          'Search products, categories...',
                          style:
                              TextStyle(color: AppTheme.textHint, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ── Hero Banner Carousel ──
            SliverToBoxAdapter(
              child: pp.banners.isEmpty
                  ? _staticBanner(context)
                  : Column(
                      children: [
                        SizedBox(
                          height: 170,
                          child: PageView.builder(
                            controller: _bannerController,
                            itemCount: pp.banners.length,
                            itemBuilder: (_, i) {
                              final banner = pp.banners[i];
                              return Container(
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 20, vertical: 8),
                                decoration: BoxDecoration(
                                  gradient: AppTheme.heroGradient,
                                  borderRadius:
                                      BorderRadius.circular(AppTheme.radiusLg),
                                  boxShadow: AppTheme.shadowLg,
                                ),
                                child: Stack(
                                  children: [
                                    // Background pattern
                                    Positioned(
                                      right: -20,
                                      bottom: -20,
                                      child: Icon(
                                        Icons.public_rounded,
                                        size: 140,
                                        color: Colors.white.withAlpha(15),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.all(24),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          const Text(
                                            'YAAMAAN',
                                            style: TextStyle(
                                              color: Colors.white60,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              letterSpacing: 2,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            banner.title,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 18,
                                              fontWeight: FontWeight.w800,
                                              height: 1.2,
                                            ),
                                            maxLines: 2,
                                          ),
                                          const SizedBox(height: 12),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 14, vertical: 7),
                                            decoration: BoxDecoration(
                                              color: AppTheme.accent,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      AppTheme.radiusFull),
                                            ),
                                            child: const Text(
                                              'Explore Now',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                        if (pp.banners.length > 1)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: SmoothPageIndicator(
                              controller: _bannerController,
                              count: pp.banners.length,
                              effect: ExpandingDotsEffect(
                                dotHeight: 6,
                                dotWidth: 6,
                                activeDotColor: AppTheme.primary,
                                dotColor: AppTheme.border,
                                expansionFactor: 3,
                              ),
                            ),
                          ),
                      ],
                    ),
            ),

            // ── Quick Stats ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Row(
                  children: [
                    _quickStat(Icons.inventory_2_outlined, 'Products',
                        '${pp.products.length}+', AppTheme.primary),
                    const SizedBox(width: 10),
                    _quickStat(Icons.store_outlined, 'Suppliers',
                        '${vp.vendors.length}', AppTheme.accent),
                    const SizedBox(width: 10),
                    _quickStat(Icons.category_outlined, 'Categories',
                        '${pp.categories.length}', AppTheme.info),
                    const SizedBox(width: 10),
                    _quickStat(Icons.local_shipping_outlined, 'Worldwide',
                        'Shipping', AppTheme.success),
                  ],
                ),
              ),
            ),

            // ── Categories ──
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Categories',
                actionText: 'See All',
                onAction: () {
                  // Navigate to products with all categories visible
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProductsScreen()),
                  );
                },
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 95,
                child: pp.categories.isEmpty
                    ? const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: pp.categories
                            .where((c) => c.isParent)
                            .length,
                        itemBuilder: (_, i) {
                          final parentCats =
                              pp.categories.where((c) => c.isParent).toList();
                          final cat = parentCats[i];
                          final categoryIcons = [
                            Icons.devices_other_rounded,
                            Icons.checkroom_rounded,
                            Icons.home_rounded,
                            Icons.directions_car_rounded,
                            Icons.headphones_rounded,
                            Icons.phone_android_rounded,
                            Icons.kitchen_rounded,
                            Icons.sports_esports_rounded,
                          ];
                          return Padding(
                            padding: const EdgeInsets.only(right: 12),
                            child: GestureDetector(
                              onTap: () {
                                pp.setCategory(cat.id);
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const ProductsScreen(),
                                  ),
                                );
                              },
                              child: Column(
                                children: [
                                  Container(
                                    width: 56,
                                    height: 56,
                                    decoration: BoxDecoration(
                                      color:
                                          AppTheme.primary.withAlpha(18),
                                      borderRadius: BorderRadius.circular(
                                          AppTheme.radiusMd),
                                    ),
                                    child: Icon(
                                      categoryIcons[
                                          i % categoryIcons.length],
                                      color: AppTheme.primary,
                                      size: 26,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  SizedBox(
                                    width: 72,
                                    child: Text(
                                      cat.name,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                      textAlign: TextAlign.center,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 8)),

            // ── Featured Products ──
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Featured Products',
                actionText: 'View All',
                onAction: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProductsScreen()),
                  );
                },
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: pp.featuredLoading && pp.featuredProducts.isEmpty
                  ? const SliverToBoxAdapter(child: ShimmerGrid(itemCount: 4))
                  : pp.featuredProducts.isEmpty
                      ? const SliverToBoxAdapter(
                          child: Center(
                            child: Padding(
                              padding: EdgeInsets.all(32),
                              child: Text('No products yet',
                                  style: TextStyle(
                                      color: AppTheme.textSecondary)),
                            ),
                          ),
                        )
                      : SliverGrid(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: isWide ? 4 : 2,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: isWide ? 0.72 : 0.62,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (_, i) => ProductCard(
                                product: pp.featuredProducts[i]),
                            childCount:
                                pp.featuredProducts.length.clamp(0, isWide ? 8 : 6),
                          ),
                        ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),

            // ── Top Suppliers ──
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Top Suppliers',
                actionText: 'View All',
                onAction: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const VendorsScreen()),
                  );
                },
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: vp.loading && vp.vendors.isEmpty
                  ? const SliverToBoxAdapter(child: ShimmerList(itemCount: 3))
                  : SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (_, i) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: VendorCard(
                            vendor: vp.vendors[i],
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => VendorDetailScreen(
                                      vendorId: vp.vendors[i].id),
                                ),
                              );
                            },
                          ),
                        ),
                        childCount: vp.vendors.length.clamp(0, 4),
                      ),
                    ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),

            // ── New Arrivals (horizontal) ──
            if (pp.products.isNotEmpty) ...[
              const SliverToBoxAdapter(
                child: SectionHeader(title: 'New Arrivals'),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 230,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: pp.products.length.clamp(0, 10),
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: SizedBox(
                        width: 160,
                        child: _newArrivalCard(
                            context, pp.products[i]),
                      ),
                    ),
                  ),
                ),
              ),
            ],

            const SliverToBoxAdapter(child: SizedBox(height: 40)),
          ],
        ),
      ),
    );
  }

  Widget _staticBanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 8, 20, 8),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppTheme.heroGradient,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        boxShadow: AppTheme.shadowLg,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'YAAMAAN B2B',
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Global\nMarketplace',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppTheme.accent,
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusFull),
                  ),
                  child: const Text(
                    'Explore Now',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.public_rounded,
              size: 80, color: Colors.white.withAlpha(40)),
        ],
      ),
    );
  }

  Widget _quickStat(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withAlpha(15),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: color.withAlpha(30)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 9, color: AppTheme.textHint),
            ),
          ],
        ),
      ),
    );
  }

  Widget _newArrivalCard(BuildContext context, product) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(productId: product.id),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppTheme.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              child: Container(
                width: double.infinity,
                color: AppTheme.surfaceVariant,
                child: product.imageUrl != null
                    ? Image.network(product.imageUrl!, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _arrivalPlaceholder())
                    : _arrivalPlaceholder(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$${product.sellingPrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _arrivalPlaceholder() {
    return Center(
      child: Icon(Icons.inventory_2_outlined,
          size: 32, color: AppTheme.textHint.withAlpha(80)),
    );
  }
}

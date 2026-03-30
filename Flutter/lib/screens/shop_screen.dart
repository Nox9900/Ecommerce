import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// import 'package:flutter_mobile_app/widgets/product_card.dart';
import 'package:flutter_mobile_app/widgets/promo_banners.dart';
import 'package:flutter_mobile_app/widgets/product_section.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/providers/shop_provider.dart';
import 'package:flutter_mobile_app/providers/auth_provider.dart';
import 'package:flutter_mobile_app/screens/_category_header_delegate.dart';
import 'package:flutter_mobile_app/screens/_subcategory_header_delegate.dart';
// import 'package:flutter_mobile_app/screens/product_detail_screen.dart';
import 'package:flutter_mobile_app/screens/search_screen.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  String _selectedCategoryId = 'all';
  String? _selectedSubcategoryId;
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final shopProvider = context.read<ShopProvider>();
      final authProvider = context.read<AuthProvider>();
      shopProvider.fetchCategories();
      shopProvider.fetchPromoBanners();
      shopProvider.fetchTrendingProducts();
      shopProvider.fetchRandomShops();
      if (authProvider.isAuthenticated) {
        shopProvider.fetchPersonalizedProducts();
      }
      shopProvider.fetchProducts();
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final shopProvider = context.read<ShopProvider>();
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200 && 
        !shopProvider.isLoadingMore && shopProvider.hasMoreProducts) {
      shopProvider.fetchMoreProducts(
        categoryId: _selectedCategoryId,
        query: _selectedSubcategoryId,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final shopProvider = context.watch<ShopProvider>();
    final theme = Theme.of(context);

    if (shopProvider.isLoading && shopProvider.products.isEmpty && shopProvider.categories.isEmpty) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          await shopProvider.fetchCategories();
          await shopProvider.fetchPromoBanners();
          await shopProvider.fetchTrendingProducts();
          if (authProvider.isAuthenticated) {
            await shopProvider.fetchPersonalizedProducts();
          }
          await shopProvider.fetchProducts(
            categoryId: _selectedCategoryId,
            query: _selectedSubcategoryId,
          );
        },
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Modern Sliver App Bar
            SliverAppBar(
              expandedHeight: 180,
              collapsedHeight: 80,
              pinned: true,
              elevation: 0,
              backgroundColor: theme.scaffoldBackgroundColor,
              surfaceTintColor: Colors.transparent,
              leading: Padding(
                padding: const EdgeInsets.only(left: 16.0),
                child: Center(
                  child: Container(
                    decoration: BoxDecoration(
                      color: theme.brightness == Brightness.dark ? Colors.grey[800] : Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.softShadow,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Icon(Icons.shopping_bag_outlined, 
                      color: theme.brightness == Brightness.dark ? Colors.white : AppTheme.primaryDefault, 
                      size: 20
                    ),
                  ),
                ),
              ),
              actions: [
                Stack(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.notifications_none_rounded, size: 28),
                      onPressed: () {},
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: AppTheme.accentRose,
                          shape: BoxShape.circle,
                          border: Border.all(color: theme.scaffoldBackgroundColor, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 100, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        authProvider.isAuthenticated 
                          ? 'Hello, ${authProvider.user?.name ?? 'Friend'}' 
                          : 'Welcome to Yaamaan',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w400,
                          color: AppTheme.textMuted,
                        ),
                      ),
                      Text(
                        'Find your style',
                        style: theme.textTheme.displayLarge?.copyWith(
                          fontSize: 28,
                          height: 1.2,
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
              delegate: _SearchHeaderDelegate(),
            ),

            // Promo Banners Section
            if (shopProvider.promoBanners.isNotEmpty)
              SliverToBoxAdapter(
                child: PromoBanners(banners: shopProvider.promoBanners),
              ),

            // Trending Products Section
            if (shopProvider.trendingProducts.isNotEmpty)
              SliverToBoxAdapter(
                child: ProductSection(
                  title: 'Trending Now',
                  products: shopProvider.trendingProducts,
                  isGrid: false,
                ),
              ),

            // Categories Sticky Header
            if (shopProvider.categories.isNotEmpty)
              SliverPersistentHeader(
                pinned: true,
                delegate: CategoryHeaderDelegate(
                  context: context,
                  selectedCategoryId: _selectedCategoryId,
                  selectedSubcategoryId: _selectedSubcategoryId,
                  categories: shopProvider.categories,
                  onCategorySelected: (catId) {
                    setState(() {
                      _selectedCategoryId = catId;
                      _selectedSubcategoryId = null;
                    });
                    if (catId == 'all') {
                      shopProvider.fetchProducts();
                    } else {
                      shopProvider.fetchProducts(categoryId: catId);
                    }
                  },
                  onAllProducts: () {
                    setState(() {
                      _selectedCategoryId = 'all';
                      _selectedSubcategoryId = null;
                    });
                    shopProvider.fetchProducts();
                  },
                  onSubcategorySelected: (subcatId) {
                    setState(() {
                      _selectedSubcategoryId = subcatId;
                    });
                    shopProvider.fetchProducts(
                      categoryId: _selectedCategoryId,
                      query: _selectedSubcategoryId,
                    );
                  },
                ),
              ),

            // Subcategories (if selected)
            if (_selectedCategoryId != 'all')
              ...shopProvider.categories
                  .where((cat) => cat.id == _selectedCategoryId)
                  .expand((cat) => cat.subcategories.isNotEmpty
                      ? [
                          SliverPersistentHeader(
                            pinned: true,
                            delegate: SubcategoryHeaderDelegate(
                              context: context,
                              selectedSubcategoryId: _selectedSubcategoryId,
                              subcategories: cat.subcategories,
                              onSubcategorySelected: (subcatId) {
                                setState(() {
                                  _selectedSubcategoryId = subcatId;
                                });
                                shopProvider.fetchProducts(
                                  categoryId: _selectedCategoryId,
                                  query: _selectedSubcategoryId,
                                );
                              },
                            ),
                          )
                        ]
                      : []),

            // Main Product Grid
            SliverPadding(
              padding: const EdgeInsets.only(top: 8.0),
              sliver: SliverToBoxAdapter(
                child: ProductSection(
                  title: _selectedCategoryId == 'all' ? 'Discover' : 'Collection',
                  products: shopProvider.products,
                  isGrid: true,
                ),
              ),
            ),

            // Loading indicator for infinite scroll
            if (shopProvider.isLoadingMore)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                ),
              ),

            // End of list indicator
            if (!shopProvider.hasMoreProducts && shopProvider.products.isNotEmpty && !shopProvider.isLoadingMore)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Column(
                    children: [
                      Icon(Icons.auto_awesome_rounded, color: Colors.grey.withOpacity(0.3), size: 32),
                      const SizedBox(height: 12),
                      Text(
                        'You\'ve seen it all!',
                        style: TextStyle(color: Colors.grey[400], fontSize: 14, fontStyle: FontStyle.italic),
                      ),
                    ],
                  ),
                ),
              ),

            // Spacer for bottom navigation
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }
}

class _SearchHeaderDelegate extends SliverPersistentHeaderDelegate {
  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    final theme = Theme.of(context);
    return Container(
      color: theme.scaffoldBackgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SearchScreen())),
        child: Container(
          height: 54,
          decoration: BoxDecoration(
            color: theme.brightness == Brightness.dark ? Colors.grey[900] : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppTheme.softShadow,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.search_rounded, color: Colors.grey),
              const SizedBox(width: 12),
              Text(
                'Search products, brands...',
                style: TextStyle(color: Colors.grey[500], fontSize: 15),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.accentIndigo.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.tune_rounded, color: AppTheme.accentIndigo, size: 20),
              ),
            ],
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

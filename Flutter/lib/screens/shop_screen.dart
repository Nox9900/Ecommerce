import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// import 'package:flutter_mobile_app/widgets/product_card.dart';
import 'package:flutter_mobile_app/widgets/promo_banners.dart';
import 'package:flutter_mobile_app/widgets/product_section.dart';
// import 'package:flutter_mobile_app/core/theme.dart';
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

  @override
  void initState() {
    super.initState();
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
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final ScrollController _scrollController = ScrollController();
    void _onScroll() {
      final shopProvider = context.read<ShopProvider>();
      if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200 && !shopProvider.isLoadingMore && shopProvider.hasMoreProducts) {
        shopProvider.fetchMoreProducts(
          categoryId: _selectedCategoryId,
          query: _selectedSubcategoryId,
        );
      }
    }
    _scrollController.addListener(_onScroll);

    return Scaffold(
      appBar: AppBar(
        title: const Text('YAAMAAN', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2)),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SearchScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<ShopProvider>(
        builder: (context, shopProvider, child) {
          if (shopProvider.isLoading && shopProvider.products.isEmpty && shopProvider.categories.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
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
                // Random Shops Section
                if (shopProvider.randomShops.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              'Featured Shops',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                          SizedBox(
                            height: 120,
                            child: ListView.separated(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              scrollDirection: Axis.horizontal,
                              itemCount: shopProvider.randomShops.length,
                              separatorBuilder: (_, _) => const SizedBox(width: 12),
                              itemBuilder: (context, index) {
                                final shop = shopProvider.randomShops[index];
                                return GestureDetector(
                                  onTap: () {
                                    // TODO: Navigate to shop detail screen
                                  },
                                  child: Container(
                                    width: 180,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black12,
                                          blurRadius: 4,
                                          offset: Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        ClipRRect(
                                          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                          child: shop.bannerUrl.isNotEmpty
                                              ? Image.network(shop.bannerUrl, height: 60, width: 180, fit: BoxFit.cover)
                                              : Container(height: 60, width: 180, color: Colors.grey[200]),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.all(8.0),
                                          child: Row(
                                            children: [
                                              CircleAvatar(
                                                backgroundImage: shop.logoUrl.isNotEmpty
                                                    ? NetworkImage(shop.logoUrl)
                                                    : null,
                                                backgroundColor: Colors.grey[300],
                                                radius: 18,
                                              ),
                                              const SizedBox(width: 8),
                                              Expanded(
                                                child: Text(
                                                  shop.name,
                                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
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
                      title: 'Trending Products',
                      products: shopProvider.trendingProducts,
                      isGrid: false,
                    ),
                  ),

                // Sticky Categories Horizontal List (after Trending)
                if (shopProvider.categories.isNotEmpty)
                  SliverPersistentHeader(
                    pinned: true,
                    floating: true,
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

                // Sticky Subcategories Horizontal List
                if (_selectedCategoryId != 'all')
                  ...shopProvider.categories
                      .where((cat) => cat.id == _selectedCategoryId)
                      .expand((cat) => cat.subcategories.isNotEmpty
                          ? [
                              SliverPersistentHeader(
                                pinned: true,
                                floating: true,
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

                // All Products Section (infinite scroll)
                SliverToBoxAdapter(
                  child: ProductSection(
                    title: 'All',
                    products: shopProvider.products,
                    isGrid: true,
                  ),
                ),

                // Loading indicator for infinite scroll
                if (shopProvider.isLoadingMore)
                  SliverToBoxAdapter(
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                  ),

                // Personalized Products Section
                if (authProvider.isAuthenticated && shopProvider.personalizedProducts.isNotEmpty)
                  SliverToBoxAdapter(
                    child: ProductSection(
                      title: 'Recommended for You',
                      products: shopProvider.personalizedProducts,
                      isGrid: true,
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

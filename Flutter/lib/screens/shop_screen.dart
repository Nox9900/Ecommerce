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
import 'package:flutter_mobile_app/screens/product_detail_screen.dart';
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
                // ...existing code...
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
                    title: 'All Products',
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/widgets/product_card.dart';
import 'package:flutter_mobile_app/widgets/promo_banners.dart';
import 'package:flutter_mobile_app/widgets/product_section.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/providers/shop_provider.dart';
import 'package:flutter_mobile_app/providers/auth_provider.dart';
import 'package:flutter_mobile_app/screens/product_detail_screen.dart';
import 'package:flutter_mobile_app/screens/search_screen.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  String _selectedCategoryId = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final shopProvider = context.read<ShopProvider>();
      final authProvider = context.read<AuthProvider>();
      
      shopProvider.fetchCategories();
      shopProvider.fetchPromoBanners();
      shopProvider.fetchTrendingProducts();
      if (authProvider.isAuthenticated) {
        shopProvider.fetchPersonalizedProducts();
      }
      shopProvider.fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
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
              await shopProvider.fetchProducts(categoryId: _selectedCategoryId);
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 100),
              child: Column(
                children: [
                  // Category Slider
                  Container(
                    height: 50,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      scrollDirection: Axis.horizontal,
                      itemCount: shopProvider.categories.length + 1,
                      separatorBuilder: (_, _) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final isAll = index == 0;
                        final categoryId = isAll ? 'all' : shopProvider.categories[index - 1].id;
                        final categoryName = isAll ? 'All' : shopProvider.categories[index - 1].name;
                        final isSelected = _selectedCategoryId == categoryId;

                        return ChoiceChip(
                          label: Text(categoryName),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedCategoryId = categoryId;
                              });
                              shopProvider.fetchProducts(categoryId: categoryId);
                            }
                          },
                          selectedColor: AppTheme.primaryDefault,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : AppTheme.textPrimary,
                          ),
                        );
                      },
                    ),
                  ),

                  if (_selectedCategoryId == 'all') ...[
                    // Discovery Features
                    PromoBanners(banners: shopProvider.promoBanners),
                    
                    if (authProvider.isAuthenticated)
                      ProductSection(
                        title: 'For You',
                        products: shopProvider.personalizedProducts,
                        icon: const Icon(Icons.favorite, color: Colors.red),
                      ),
                    
                    ProductSection(
                      title: 'Trending Now',
                      products: shopProvider.trendingProducts,
                      icon: const Icon(Icons.flash_on, color: Colors.orange),
                    ),
                  ],

                  // Products Grid Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: [
                        const Text(
                          'Our Products',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        if (shopProvider.isLoading)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                      ],
                    ),
                  ),

                  // Products Grid
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.65,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: shopProvider.products.length,
                      itemBuilder: (context, index) {
                        final product = shopProvider.products[index];
                        return ProductCard(
                          product: product,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ProductDetailScreen(product: product),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

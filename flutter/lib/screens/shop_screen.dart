import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/product_card.dart';
import '../core/theme.dart';
import '../providers/shop_provider.dart';
import 'product_detail_screen.dart';

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
      shopProvider.fetchCategories();
      shopProvider.fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yaamaan'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<ShopProvider>(
        builder: (context, shopProvider, child) {
          if (shopProvider.isLoading && shopProvider.products.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (shopProvider.error.isNotEmpty && shopProvider.products.isEmpty) {
            return Center(child: Text(shopProvider.error));
          }

          return RefreshIndicator(
            onRefresh: () async {
              await shopProvider.fetchCategories();
              await shopProvider.fetchProducts(categoryId: _selectedCategoryId);
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 20),
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
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
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

                  // Products Grid
                  if (shopProvider.isLoading && shopProvider.products.isNotEmpty)
                    const LinearProgressIndicator(),
                  
                  Padding(
                    padding: const EdgeInsets.all(16.0),
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

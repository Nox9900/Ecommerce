import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/providers/shop_provider.dart';
import 'package:flutter_mobile_app/widgets/product_card.dart';
import 'package:flutter_mobile_app/screens/product_detail_screen.dart';
import 'package:flutter_mobile_app/core/theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search products...',
            border: InputBorder.none,
          ),
          onSubmitted: (value) async {
            setState(() {
              _isSearching = true;
              _searchQuery = value;
            });
            await Provider.of<ShopProvider>(context, listen: false)
                .fetchProducts(query: value);
            setState(() {
              _isSearching = false;
            });
          },
          onChanged: (value) {
            setState(() {
              _searchQuery = value;
            });
          },
        ),
        actions: [
          if (_searchQuery.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                setState(() => _searchQuery = '');
                Provider.of<ShopProvider>(context, listen: false)
                    .fetchProducts(query: '');
              },
            ),
        ],
      ),
      body: Consumer<ShopProvider>(
        builder: (context, shop, child) {
          if (_searchQuery.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search, size: 64, color: AppTheme.textMuted),
                  SizedBox(height: 16),
                  Text('Search for your favorite items', style: TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            );
          }
          if (_isSearching) {
            return const Center(child: CircularProgressIndicator());
          }
          final results = shop.products.where((p) =>
            p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            p.description.toLowerCase().contains(_searchQuery.toLowerCase())
          ).toList();
          if (results.isEmpty) {
            return const Center(
              child: Text('No results found'),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.65,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: results.length,
            itemBuilder: (context, index) {
              final product = results[index];
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
          );
        },
      ),
    );
  }
}

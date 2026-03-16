import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/providers/shop_provider.dart';
import 'package:flutter_mobile_app/widgets/product_card.dart';
import 'package:flutter_mobile_app/screens/product_detail_screen.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  bool _isSearching = false;
  List<String> _searchHistory = [];
  bool _showHistory = true;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadSearchHistory();
  }

  void _loadSearchHistory() async {
    // For simplicity, using SharedPreferences. If not available, use local storage or memory.
    // ignore: invalid_use_of_visible_for_testing_member, invalid_use_of_protected_member
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _searchHistory = prefs.getStringList('search_history') ?? [];
    });
  }

  void _saveSearchHistory() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setStringList('search_history', _searchHistory);
  }

  void _addToHistory(String query) {
    if (query.isEmpty) return;
    setState(() {
      _searchHistory.remove(query);
      _searchHistory.insert(0, query);
      if (_searchHistory.length > 10) {
        _searchHistory = _searchHistory.sublist(0, 10);
      }
      _saveSearchHistory();
    });
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
              _showHistory = false;
            });
            await Provider.of<ShopProvider>(context, listen: false)
                .fetchProducts(query: value);
            _addToHistory(value);
            setState(() {
              _isSearching = false;
            });
          },
          onChanged: (value) {
            setState(() {
              _searchQuery = value;
              _showHistory = value.isEmpty;
            });
          },
        ),
        actions: [
          if (_searchQuery.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _searchQuery = '';
                  _showHistory = true;
                });
                Provider.of<ShopProvider>(context, listen: false)
                    .fetchProducts(query: '');
              },
            ),
        ],
      ),
      body: _showHistory
          ? ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text('Search History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                ..._searchHistory.map((query) => ListTile(
                      leading: const Icon(Icons.history),
                      title: Text(query),
                      trailing: IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          setState(() {
                            _searchHistory.remove(query);
                            _saveSearchHistory();
                          });
                        },
                      ),
                      onTap: () async {
                        _searchController.text = query;
                        setState(() {
                          _searchQuery = query;
                          _showHistory = false;
                          _isSearching = true;
                        });
                        await Provider.of<ShopProvider>(context, listen: false)
                            .fetchProducts(query: query);
                        _addToHistory(query);
                        setState(() {
                          _isSearching = false;
                        });
                      },
                    )),
              ],
            )
          : Consumer<ShopProvider>(
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
                if (_isSearching || shop.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                final results = shop.products;
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

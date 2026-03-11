import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/shimmer_loading.dart';
import 'product_detail_screen.dart';

class ProductsScreen extends StatefulWidget {
  final bool embedded;
  final bool autoFocusSearch;

  const ProductsScreen({
    super.key,
    this.embedded = false,
    this.autoFocusSearch = false,
  });

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  final _searchFocusNode = FocusNode();
  Timer? _debounce;
  List<Map<String, dynamic>> _suggestions = [];
  bool _showSuggestions = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _searchFocusNode.addListener(() {
      if (!_searchFocusNode.hasFocus) {
        // Delay hiding so tap on suggestion can register
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) setState(() => _showSuggestions = false);
        });
      }
    });
    final pp = context.read<ProductProvider>();
    _searchController.text = pp.searchQuery;
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _scrollController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _fetchSuggestions(String query) {
    _debounce?.cancel();
    if (query.length < 2) {
      setState(() {
        _suggestions = [];
        _showSuggestions = false;
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      try {
        final api = context.read<AuthProvider>().api;
        final data = await api.get('${ApiConfig.products}?q=$query&limit=5');
        if (!mounted) return;
        final products = (data['products'] as List?) ?? [];
        final list = products
            .cast<Map<String, dynamic>>()
            .map((p) => <String, dynamic>{
                'type': 'product',
                'id': p['_id'] ?? '',
                'name': p['name'] ?? '',
                'price': p['price'],
              })
            .toList();
        setState(() {
          _suggestions = list;
          _showSuggestions = list.isNotEmpty;
        });
      } catch (_) {
        // Silently ignore suggestion failures
      }
    });
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<ProductProvider>().fetchProducts();
    }
  }

  @override
  Widget build(BuildContext context) {
    final pp = context.watch<ProductProvider>();
    final width = MediaQuery.of(context).size.width;
    final isWide = width > 700;
    final crossAxisCount = isWide ? 4 : 2;

    return Scaffold(
      appBar: widget.embedded
          ? null
          : AppBar(
              title: const Text('Products'),
              surfaceTintColor: Colors.transparent,
              backgroundColor: AppTheme.white,
            ),
      body: Column(
        children: [
          // ── Search Bar + Suggestions ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _searchController,
                  focusNode: _searchFocusNode,
                  autofocus: widget.autoFocusSearch,
                  decoration: InputDecoration(
                    hintText: 'Search products...',
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close_rounded, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              pp.setSearch('');
                              setState(() {
                                _suggestions = [];
                                _showSuggestions = false;
                              });
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppTheme.surfaceVariant,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      borderSide:
                          const BorderSide(color: AppTheme.primary, width: 1.5),
                    ),
                  ),
                  onChanged: (v) {
                    pp.setSearch(v);
                    _fetchSuggestions(v);
                    setState(() {});
                  },
                ),
                // Suggestions dropdown
                if (_showSuggestions && _suggestions.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.white,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(20),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: _suggestions.map((s) {
                          final isProduct = s['type'] == 'product';
                          final isCategory = s['type'] == 'category';
                          return InkWell(
                            onTap: () {
                              setState(() => _showSuggestions = false);
                              _searchFocusNode.unfocus();
                              if (isProduct && s['id'] != null) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ProductDetailScreen(
                                        productId: s['id']),
                                  ),
                                );
                              } else if (isCategory && s['id'] != null) {
                                pp.setCategory(s['id']);
                                _searchController.clear();
                                pp.setSearch('');
                              } else {
                                _searchController.text = s['name'] ?? '';
                                pp.setSearch(s['name'] ?? '');
                              }
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              child: Row(
                                children: [
                                  Icon(
                                    isProduct
                                        ? Icons.inventory_2_outlined
                                        : isCategory
                                            ? Icons.category_outlined
                                            : Icons.search_rounded,
                                    size: 18,
                                    color: AppTheme.textHint,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      s['name'] ?? '',
                                      style: const TextStyle(fontSize: 13),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (isProduct && s['price'] != null)
                                    Text(
                                      s['price'],
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  if (isCategory)
                                    const Text(
                                      'Category',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AppTheme.textHint,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // ── Category Chips ──
          if (pp.categories.isNotEmpty)
            SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: pp.categories.length + 1,
                itemBuilder: (_, i) {
                  if (i == 0) {
                    return _categoryChip('All', null, pp.selectedCategoryId);
                  }
                  final cat = pp.categories[i - 1];
                  return _categoryChip(cat.name, cat.id, pp.selectedCategoryId);
                },
              ),
            ),

          // ── Sort & Count Bar ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(
              children: [
                Text(
                  '${pp.products.length} products',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                _sortDropdown(pp),
              ],
            ),
          ),

          // ── Product Grid ──
          Expanded(
            child: pp.loading && pp.products.isEmpty
                ? Padding(
                    padding: const EdgeInsets.all(16),
                    child: ShimmerGrid(itemCount: crossAxisCount * 2),
                  )
                : pp.products.isEmpty
                    ? _emptyState()
                    : RefreshIndicator(
                        onRefresh: () => pp.fetchProducts(refresh: true),
                        child: GridView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: pp.products.length + (pp.loading ? 2 : 0),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: crossAxisCount,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: isWide ? 0.72 : 0.62,
                          ),
                          itemBuilder: (_, i) {
                            if (i >= pp.products.length) {
                              return Container(
                                decoration: BoxDecoration(
                                  color: AppTheme.surfaceVariant,
                                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                ),
                              );
                            }
                            return ProductCard(product: pp.products[i]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _categoryChip(String label, String? catId, String? selectedId) {
    final active = catId == selectedId;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: FilterChip(
        label: Text(label),
        selected: active,
        onSelected: (_) {
          context.read<ProductProvider>().setCategory(catId);
        },
        labelStyle: TextStyle(
          fontSize: 12,
          fontWeight: active ? FontWeight.w600 : FontWeight.normal,
          color: active ? Colors.white : AppTheme.textPrimary,
        ),
        backgroundColor: AppTheme.surface,
        selectedColor: AppTheme.primary,
        showCheckmark: false,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusFull),
          side: BorderSide(
            color: active ? AppTheme.primary : AppTheme.border,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 6),
      ),
    );
  }

  Widget _sortDropdown(ProductProvider pp) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.border),
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: pp.sort,
          isDense: true,
          icon: const Icon(Icons.unfold_more_rounded, size: 16),
          style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary),
          items: const [
            DropdownMenuItem(value: '-createdAt', child: Text('Newest')),
            DropdownMenuItem(value: 'price', child: Text('Price: Low → High')),
            DropdownMenuItem(value: '-price', child: Text('Price: High → Low')),
            DropdownMenuItem(value: 'name', child: Text('Name: A → Z')),
            DropdownMenuItem(value: '-name', child: Text('Name: Z → A')),
          ],
          onChanged: (v) {
            if (v != null) pp.setSort(v);
          },
        ),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.search_off_rounded,
              size: 64, color: AppTheme.textHint.withAlpha(80)),
          const SizedBox(height: 16),
          const Text(
            'No products found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try a different search or category',
            style: TextStyle(fontSize: 13, color: AppTheme.textHint),
          ),
          const SizedBox(height: 20),
          TextButton.icon(
            onPressed: () {
              _searchController.clear();
              final pp = context.read<ProductProvider>();
              pp.setSearch('');
              pp.setCategory(null);
            },
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Clear Filters'),
          ),
        ],
      ),
    );
  }
}

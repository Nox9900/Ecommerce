import 'dart:async';
import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/banner.dart';
import '../services/api_service.dart';

class ProductProvider extends ChangeNotifier {
  final ApiService _api;

  List<Product> _products = [];
  List<Product> _featuredProducts = [];
  List<Category> _categories = [];
  List<HeroBanner> _banners = [];
  Product? _selectedProduct;
  bool _loading = false;
  bool _featuredLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String? _error;
  int? _selectedCategoryId;
  String _searchQuery = '';
  String _ordering = '-created_at';
  Timer? _debounce;

  ProductProvider(this._api);

  List<Product> get products => _products;
  List<Product> get featuredProducts => _featuredProducts;
  List<Category> get categories => _categories;
  List<HeroBanner> get banners => _banners;
  Product? get selectedProduct => _selectedProduct;
  bool get loading => _loading;
  bool get featuredLoading => _featuredLoading;
  bool get hasMore => _hasMore;
  String? get error => _error;
  int? get selectedCategoryId => _selectedCategoryId;
  String get searchQuery => _searchQuery;
  String get ordering => _ordering;

  Future<void> fetchCategories() async {
    try {
      final data = await _api.get(ApiConfig.categories, queryParams: {'page_size': '100'});
      final results = data['results'] as List;
      _categories = results.map((e) => Category.fromJson(e)).toList();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchBanners() async {
    try {
      final data = await _api.get(ApiConfig.banners);
      if (data is List) {
        _banners = data.map((e) => HeroBanner.fromJson(e)).toList();
      } else if (data is Map && data['results'] != null) {
        _banners = (data['results'] as List)
            .map((e) => HeroBanner.fromJson(e))
            .toList();
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchProducts({bool refresh = false}) async {
    if (_loading) return;

    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _products = [];
    }

    if (!_hasMore) return;

    _loading = true;
    notifyListeners();

    try {
      final params = <String, String>{
        'page': '$_currentPage',
        'ordering': _ordering,
      };
      if (_selectedCategoryId != null) {
        params['category'] = '$_selectedCategoryId';
      }
      if (_searchQuery.isNotEmpty) {
        params['search'] = _searchQuery;
      }

      final data = await _api.get(ApiConfig.products, queryParams: params);
      final results =
          (data['results'] as List).map((e) => Product.fromJson(e)).toList();

      if (refresh) {
        _products = results;
      } else {
        _products.addAll(results);
      }

      _hasMore = data['next'] != null;
      if (_hasMore) _currentPage++;

      _loading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchFeaturedProducts() async {
    _featuredLoading = true;
    notifyListeners();
    try {
      final data = await _api.get(ApiConfig.featuredProducts);
      if (data is List) {
        _featuredProducts = data.map((e) => Product.fromJson(e)).toList();
      } else if (data is Map && data['results'] != null) {
        _featuredProducts =
            (data['results'] as List).map((e) => Product.fromJson(e)).toList();
      }
      _featuredLoading = false;
      notifyListeners();
    } catch (e) {
      _featuredLoading = false;
      // Fallback to regular products
      try {
        final data = await _api.get(ApiConfig.products);
        final results =
            (data['results'] as List).map((e) => Product.fromJson(e)).toList();
        _featuredProducts = results.take(12).toList();
      } catch (_) {}
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchProduct(int id) async {
    _loading = true;
    _selectedProduct = null;
    notifyListeners();
    try {
      final data = await _api.get('${ApiConfig.products}$id/');
      _selectedProduct = Product.fromJson(data);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  void setCategory(int? categoryId) {
    _selectedCategoryId = categoryId;
    fetchProducts(refresh: true);
  }

  void setSearch(String query) {
    _searchQuery = query;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      fetchProducts(refresh: true);
    });
  }

  void setOrdering(String ordering) {
    _ordering = ordering;
    fetchProducts(refresh: true);
  }

  void clearFilters() {
    _selectedCategoryId = null;
    _searchQuery = '';
    _ordering = '-created_at';
    fetchProducts(refresh: true);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}

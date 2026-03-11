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
  List<Product> _trendingProducts = [];
  List<Category> _categories = [];
  List<PromoBanner> _banners = [];
  Product? _selectedProduct;
  bool _loading = false;
  bool _trendingLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  int _totalPages = 1;
  String? _error;
  String? _selectedCategoryId;
  String? _selectedSubcategory;
  String _searchQuery = '';
  String _sort = '-createdAt';
  double? _minPrice;
  double? _maxPrice;
  double? _minRating;
  Timer? _debounce;

  ProductProvider(this._api);

  List<Product> get products => _products;
  List<Product> get trendingProducts => _trendingProducts;
  List<Category> get categories => _categories;
  List<PromoBanner> get banners => _banners;
  Product? get selectedProduct => _selectedProduct;
  bool get loading => _loading;
  bool get trendingLoading => _trendingLoading;
  bool get hasMore => _hasMore;
  String? get error => _error;
  String? get selectedCategoryId => _selectedCategoryId;
  String get searchQuery => _searchQuery;
  String get sort => _sort;

  /// Fetch active categories from GET /api/categories (returns array).
  Future<void> fetchCategories() async {
    try {
      final data = await _api.get(ApiConfig.categories);
      if (data is List) {
        _categories = data.map((e) => Category.fromJson(e)).toList();
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Fetch promo banners from GET /api/promo-banners (returns array).
  Future<void> fetchBanners() async {
    try {
      final data = await _api.get(ApiConfig.promoBanners);
      if (data is List) {
        _banners = data.map((e) => PromoBanner.fromJson(e)).toList();
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Fetch products from GET /api/products.
  /// Backend returns: { products: [], total, page, pages }
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
        'limit': '${ApiConfig.pageSize}',
        'sort': _sort,
      };
      if (_selectedCategoryId != null) {
        params['category'] = _selectedCategoryId!;
      }
      if (_selectedSubcategory != null) {
        params['subcategory'] = _selectedSubcategory!;
      }
      if (_searchQuery.isNotEmpty) {
        params['q'] = _searchQuery;
      }
      if (_minPrice != null) {
        params['minPrice'] = '$_minPrice';
      }
      if (_maxPrice != null) {
        params['maxPrice'] = '$_maxPrice';
      }
      if (_minRating != null) {
        params['minRating'] = '$_minRating';
      }

      final data = await _api.get(ApiConfig.products, queryParams: params);

      List<Product> results = [];
      if (data is Map) {
        final list = data['products'] as List? ?? [];
        results = list.map((e) => Product.fromJson(e)).toList();
        _totalPages = data['pages'] ?? 1;
        _hasMore = _currentPage < _totalPages;
      }

      if (refresh) {
        _products = results;
      } else {
        _products.addAll(results);
      }

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

  /// Fetch trending products from GET /api/recommendations/trending (returns array).
  Future<void> fetchTrendingProducts() async {
    _trendingLoading = true;
    notifyListeners();
    try {
      final data = await _api.get(ApiConfig.trendingProducts);
      if (data is List) {
        _trendingProducts = data.map((e) => Product.fromJson(e)).toList();
      }
      _trendingLoading = false;
      notifyListeners();
    } catch (e) {
      _trendingLoading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Fetch a single product by ID from GET /api/products/:id.
  Future<void> fetchProduct(String id) async {
    _loading = true;
    _selectedProduct = null;
    notifyListeners();
    try {
      final data = await _api.get(ApiConfig.product(id));
      _selectedProduct = Product.fromJson(data);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  void setCategory(String? categoryId) {
    _selectedCategoryId = categoryId;
    _selectedSubcategory = null;
    fetchProducts(refresh: true);
  }

  void setSubcategory(String? subcategory) {
    _selectedSubcategory = subcategory;
    fetchProducts(refresh: true);
  }

  void setSearch(String query) {
    _searchQuery = query;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      fetchProducts(refresh: true);
    });
  }

  void setSort(String sort) {
    _sort = sort;
    fetchProducts(refresh: true);
  }

  void setPriceRange({double? min, double? max}) {
    _minPrice = min;
    _maxPrice = max;
    fetchProducts(refresh: true);
  }

  void setMinRating(double? rating) {
    _minRating = rating;
    fetchProducts(refresh: true);
  }

  void clearFilters() {
    _selectedCategoryId = null;
    _selectedSubcategory = null;
    _searchQuery = '';
    _sort = '-createdAt';
    _minPrice = null;
    _maxPrice = null;
    _minRating = null;
    fetchProducts(refresh: true);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}

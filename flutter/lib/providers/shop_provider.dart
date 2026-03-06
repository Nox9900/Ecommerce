import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/models/category.dart';
import 'package:flutter_mobile_app/models/product.dart';
import 'package:flutter_mobile_app/models/promo_banner.dart';

class ShopProvider with ChangeNotifier {
  final ApiClient _apiClient;

  List<Category> _categories = [];
  List<Product> _products = [];
  List<PromoBanner> _promoBanners = [];
  List<Product> _trendingProducts = [];
  List<Product> _personalizedProducts = [];
  bool _isLoading = false;
  String _error = '';

  ShopProvider(this._apiClient);

  List<Category> get categories => _categories;
  List<Product> get products => _products;
  List<PromoBanner> get promoBanners => _promoBanners;
  List<Product> get trendingProducts => _trendingProducts;
  List<Product> get personalizedProducts => _personalizedProducts;
  bool get isLoading => _isLoading;
  String get error => _error;

  Future<void> fetchCategories() async {
    _isLoading = true;
    _error = '';
    notifyListeners();

    try {
      final response = await _apiClient.dio.get('/categories');
      if (response.data != null) {
        _categories = (response.data as List)
            .map((json) => Category.fromJson(json))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load categories';
      ApiClient.debugPrint('Error fetching categories: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProducts({String? categoryId, String? query}) async {
    _isLoading = true;
    _error = '';
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{};
      if (categoryId != null && categoryId != 'all') {
        queryParams['category'] = _categories.firstWhere((c) => c.id == categoryId).name;
      }
      if (query != null && query.isNotEmpty) {
        queryParams['q'] = query;
      }

      final response = await _apiClient.dio.get('/products', queryParameters: queryParams);
      if (response.data != null) {
        _products = (response.data as List)
            .map((json) => Product.fromJson(json))
            .toList();
      }
    } catch (e) {
      _error = 'Failed to load products';
      ApiClient.debugPrint('Error fetching products: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchPromoBanners() async {
    try {
      final response = await _apiClient.dio.get('/promo-banners');
      if (response.data != null) {
        _promoBanners = (response.data as List)
            .map((json) => PromoBanner.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      ApiClient.debugPrint('Error fetching promo banners: $e');
    }
  }

  Future<void> fetchTrendingProducts() async {
    try {
      final response = await _apiClient.dio.get('/recommendations/trending');
      if (response.data != null) {
        _trendingProducts = (response.data as List)
            .map((json) => Product.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      ApiClient.debugPrint('Error fetching trending products: $e');
    }
  }

  Future<void> fetchPersonalizedProducts() async {
    try {
      final response = await _apiClient.dio.get('/recommendations/personalized');
      if (response.data != null) {
        _personalizedProducts = (response.data as List)
            .map((json) => Product.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      ApiClient.debugPrint('Error fetching personalized products: $e');
    }
  }
}

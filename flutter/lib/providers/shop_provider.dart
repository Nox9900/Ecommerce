import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../models/category.dart';
import '../models/product.dart';

class ShopProvider with ChangeNotifier {
  final ApiClient _apiClient;

  List<Category> _categories = [];
  List<Product> _products = [];
  bool _isLoading = false;
  String _error = '';

  ShopProvider(this._apiClient);

  List<Category> get categories => _categories;
  List<Product> get products => _products;
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
}

import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/models/product.dart';
import 'package:flutter_mobile_app/services/user_service.dart';
import 'package:flutter_mobile_app/core/api_client.dart';

class WishlistProvider with ChangeNotifier {
  UserService? _userService;
  final List<Product> _items = [];
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  List<Product> get items => [..._items];
  bool get isLoading => _isLoading;
  String? get error => _error;

  void init(ApiClient apiClient, {required bool isAuthenticated}) {
    _userService = UserService(apiClient);
    _isAuthenticated = isAuthenticated;
    if (isAuthenticated) {
      fetchWishlist();
    }
  }

  bool isWishlisted(String productId) {
    return _items.any((item) => item.id == productId);
  }

  Future<void> fetchWishlist() async {
    if (_userService == null || !_isAuthenticated) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _userService!.getWishlist();
    if (result.isSuccess && result.data != null) {
      _items.clear();
      _items.addAll(result.data!);
    } else {
      _error = result.error;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> toggleWishlist(Product product) async {
    final isCurrentlyWishlisted = isWishlisted(product.id);

    // Optimistic update
    if (isCurrentlyWishlisted) {
      _items.removeWhere((item) => item.id == product.id);
    } else {
      _items.add(product);
    }
    notifyListeners();

    if (_userService == null || !_isAuthenticated) return;

    // Sync with backend
    final result = isCurrentlyWishlisted
        ? await _userService!.removeFromWishlist(product.id)
        : await _userService!.addToWishlist(product.id);

    if (result.isFailure) {
      // Revert optimistic update on failure
      if (isCurrentlyWishlisted) {
        _items.add(product);
      } else {
        _items.removeWhere((item) => item.id == product.id);
      }
      _error = result.error;
      notifyListeners();
    }
  }

  void clearWishlist() {
    _items.clear();
    notifyListeners();
  }
}

import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/cart_service.dart';
import '../core/api_client.dart';

class CartProvider with ChangeNotifier {
  CartService? _cartService;
  BackendCart? _backendCart;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  // Local-only fallback items for unauthenticated users
  final List<_LocalCartItem> _localItems = [];

  List<BackendCartItem> get items => _backendCart?.items ?? [];
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get appliedCoupon => _backendCart?.coupon;

  int get itemCount {
    if (_isAuthenticated && _backendCart != null) {
      return _backendCart!.itemCount;
    }
    return _localItems.fold(0, (sum, item) => sum + item.quantity);
  }

  double get totalAmount {
    if (_isAuthenticated && _backendCart != null) {
      return _backendCart!.totalAmount;
    }
    return _localItems.fold(0.0, (sum, item) => sum + item.product.price * item.quantity);
  }

  void init(ApiClient apiClient, {required bool isAuthenticated}) {
    _cartService = CartService(apiClient);
    _isAuthenticated = isAuthenticated;
    if (isAuthenticated) {
      fetchCart();
    }
  }

  Future<void> fetchCart() async {
    if (_cartService == null || !_isAuthenticated) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _cartService!.getCart();
    if (result.isSuccess) {
      _backendCart = result.data;
    } else {
      _error = result.error;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addItem(Product product, {int quantity = 1, String? variantId, Map<String, String>? options}) async {
    if (_cartService == null || !_isAuthenticated) {
      // Local fallback for unauthenticated users
      final existing = _localItems.indexWhere((i) => i.product.id == product.id && i.variantId == variantId);
      if (existing >= 0) {
        _localItems[existing].quantity += quantity;
      } else {
        _localItems.add(_LocalCartItem(product: product, quantity: quantity, variantId: variantId));
      }
      notifyListeners();
      return;
    }

    _error = null;
    final result = await _cartService!.addToCart(
      productId: product.id,
      quantity: quantity,
      variantId: variantId,
      selectedOptions: options,
    );

    if (result.isSuccess) {
      _backendCart = result.data;
    } else {
      _error = result.error;
    }
    notifyListeners();
  }

  Future<void> removeItem(String productId, {String? variantId}) async {
    if (_cartService == null || !_isAuthenticated) {
      _localItems.removeWhere((i) => i.product.id == productId && i.variantId == variantId);
      notifyListeners();
      return;
    }

    _error = null;
    final result = await _cartService!.removeFromCart(productId);
    if (result.isSuccess) {
      _backendCart = result.data;
    } else {
      _error = result.error;
    }
    notifyListeners();
  }

  Future<void> updateQuantity(String productId, int quantity, {String? variantId}) async {
    if (_cartService == null || !_isAuthenticated) {
      final index = _localItems.indexWhere((i) => i.product.id == productId && i.variantId == variantId);
      if (index >= 0) {
        if (quantity <= 0) {
          _localItems.removeAt(index);
        } else {
          _localItems[index].quantity = quantity;
        }
      }
      notifyListeners();
      return;
    }

    if (quantity <= 0) {
      await removeItem(productId, variantId: variantId);
      return;
    }

    _error = null;
    final result = await _cartService!.updateCartItem(productId, quantity: quantity, variantId: variantId);
    if (result.isSuccess) {
      _backendCart = result.data;
    } else {
      _error = result.error;
    }
    notifyListeners();
  }

  Future<void> clear() async {
    if (_cartService == null || !_isAuthenticated) {
      _localItems.clear();
      notifyListeners();
      return;
    }

    _error = null;
    final result = await _cartService!.clearCart();
    if (result.isSuccess) {
      _backendCart = null;
    } else {
      _error = result.error;
    }
    notifyListeners();
  }

  Future<void> applyCoupon(String code) async {
    if (_cartService == null || !_isAuthenticated) return;

    _error = null;
    final result = await _cartService!.applyCoupon(code);
    if (result.isSuccess) {
      _backendCart = result.data;
    } else {
      _error = result.error;
    }
    notifyListeners();
  }

  Future<void> removeCoupon() async {
    if (_cartService == null || !_isAuthenticated) return;

    _error = null;
    final result = await _cartService!.removeCoupon();
    if (result.isSuccess) {
      _backendCart = result.data;
    } else {
      _error = result.error;
    }
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

class _LocalCartItem {
  final Product product;
  int quantity;
  final String? variantId;
  _LocalCartItem({required this.product, this.quantity = 1, this.variantId});
}

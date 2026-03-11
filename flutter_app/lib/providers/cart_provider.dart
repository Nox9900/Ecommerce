import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';

/// Server-side cart provider that syncs with the backend.
/// Cart operations go through /api/cart endpoints.
class CartProvider extends ChangeNotifier {
  ApiService? _api;
  Cart _cart = Cart();
  bool _loading = false;
  String? _error;

  Cart get cart => _cart;
  List<CartItem> get items => _cart.items;
  int get itemCount => _cart.itemCount;
  bool get isEmpty => _cart.isEmpty;
  double get subtotal => _cart.subtotal;
  double get discountAmount => _cart.discountAmount;
  double get total => _cart.totalPrice;
  int get totalQuantity => _cart.totalQuantity;
  bool get loading => _loading;
  String? get error => _error;
  String? get couponCode => _cart.couponCode;
  Map<String, dynamic>? get couponDetails => _cart.couponDetails;

  void setApi(ApiService api) => _api = api;

  bool isInCart(String productId) {
    return _cart.items.any((item) => item.product.id == productId);
  }

  /// Fetch the cart from the server: GET /api/cart
  Future<void> fetchCart() async {
    if (_api == null) return;
    _loading = true;
    notifyListeners();
    try {
      final data = await _api!.get(ApiConfig.cart);
      if (data != null && data['cart'] != null) {
        _cart = Cart.fromJson(data['cart']);
      }
      _loading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Add an item to the cart: POST /api/cart
  Future<String?> addItem(
    String productId, {
    int quantity = 1,
    String? variantId,
    Map<String, dynamic>? selectedOptions,
  }) async {
    if (_api == null) return 'Not authenticated';
    try {
      final body = <String, dynamic>{
        'productId': productId,
        'quantity': quantity,
      };
      if (variantId != null) body['variantId'] = variantId;
      if (selectedOptions != null) body['selectedOptions'] = selectedOptions;

      final data = await _api!.post(ApiConfig.cart, body: body);
      if (data != null && data['cart'] != null) {
        _cart = Cart.fromJson(data['cart']);
      }
      notifyListeners();
      return null;
    } catch (e) {
      return e.toString();
    }
  }

  /// Update item quantity: PUT /api/cart/:productId
  Future<void> updateQuantity(String productId, int quantity) async {
    if (_api == null) return;
    try {
      final data = await _api!.put(
        ApiConfig.cartItem(productId),
        body: {'quantity': quantity},
      );
      if (data != null && data['cart'] != null) {
        _cart = Cart.fromJson(data['cart']);
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Remove item from cart: DELETE /api/cart/:productId
  Future<void> removeItem(String productId) async {
    if (_api == null) return;
    try {
      final data = await _api!.delete(ApiConfig.cartItem(productId));
      if (data != null && data['cart'] != null) {
        _cart = Cart.fromJson(data['cart']);
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Clear the entire cart: DELETE /api/cart
  Future<void> clear() async {
    if (_api == null) return;
    try {
      await _api!.delete(ApiConfig.cart);
      _cart = Cart();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Apply a coupon: POST /api/cart/coupon
  Future<String?> applyCoupon(String code) async {
    if (_api == null) return 'Not authenticated';
    try {
      final data = await _api!.post(
        ApiConfig.cartCoupon,
        body: {'code': code},
      );
      if (data != null && data['cart'] != null) {
        _cart = Cart.fromJson(data['cart']);
      }
      notifyListeners();
      return null;
    } catch (e) {
      return e.toString();
    }
  }

  /// Remove coupon: DELETE /api/cart/coupon
  Future<void> removeCoupon() async {
    if (_api == null) return;
    try {
      final data = await _api!.delete(ApiConfig.cartCoupon);
      if (data != null && data['cart'] != null) {
        _cart = Cart.fromJson(data['cart']);
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Reset local cart state (e.g., on logout).
  void reset() {
    _cart = Cart();
    notifyListeners();
  }
}

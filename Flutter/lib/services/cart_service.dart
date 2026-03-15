import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';
import 'package:flutter_mobile_app/models/product.dart';

/// Backend cart item with populated product data.
class BackendCartItem {
  final Product product;
  int quantity;
  final String? variantId;
  final Map<String, String>? selectedOptions;

  BackendCartItem({
    required this.product,
    this.quantity = 1,
    this.variantId,
    this.selectedOptions,
  });

  double get totalPrice => product.price * quantity;

  factory BackendCartItem.fromJson(Map<String, dynamic> json) {
    return BackendCartItem(
      product: Product.fromJson(json['product'] is Map ? json['product'] : {'_id': json['product']}),
      quantity: json['quantity'] ?? 1,
      variantId: json['variantId'],
      selectedOptions: json['selectedOptions'] != null
          ? Map<String, String>.from(json['selectedOptions'])
          : null,
    );
  }
}

/// Represents the full cart from the backend.
class BackendCart {
  final String id;
  final List<BackendCartItem> items;
  final String? coupon;

  BackendCart({
    required this.id,
    required this.items,
    this.coupon,
  });

  factory BackendCart.fromJson(Map<String, dynamic> json) {
    return BackendCart(
      id: json['_id'] ?? '',
      items: (json['items'] as List? ?? [])
          .map((item) => BackendCartItem.fromJson(item))
          .toList(),
      coupon: json['coupon'],
    );
  }

  double get totalAmount => items.fold(0.0, (sum, item) => sum + item.totalPrice);
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
}

class CartService {
  final ApiClient _apiClient;

  CartService(this._apiClient);

  Future<ApiResult<BackendCart>> getCart() async {
    return _apiClient.get<BackendCart>(
      '/cart',
      fromJson: (data) => BackendCart.fromJson(data),
    );
  }

  Future<ApiResult<BackendCart>> addToCart({
    required String productId,
    int quantity = 1,
    String? variantId,
    Map<String, String>? selectedOptions,
  }) async {
    return _apiClient.post<BackendCart>(
      '/cart',
      data: {
        'productId': productId,
        'quantity': quantity,
        'variantId': ?variantId,
        'selectedOptions': ?selectedOptions,
      },
      fromJson: (data) => BackendCart.fromJson(data),
    );
  }

  Future<ApiResult<BackendCart>> updateCartItem(
    String productId, {
    required int quantity,
    String? variantId,
  }) async {
    return _apiClient.put<BackendCart>(
      '/cart/$productId',
      data: {
        'quantity': quantity,
        'variantId': ?variantId,
      },
      fromJson: (data) => BackendCart.fromJson(data),
    );
  }

  Future<ApiResult<BackendCart>> removeFromCart(String productId) async {
    return _apiClient.delete<BackendCart>(
      '/cart/$productId',
      fromJson: (data) => BackendCart.fromJson(data),
    );
  }

  Future<ApiResult<void>> clearCart() async {
    return _apiClient.delete<void>(
      '/cart',
      fromJson: (_) {},
    );
  }

  Future<ApiResult<BackendCart>> applyCoupon(String code) async {
    return _apiClient.post<BackendCart>(
      '/cart/coupon',
      data: {'code': code},
      fromJson: (data) => BackendCart.fromJson(data),
    );
  }

  Future<ApiResult<BackendCart>> removeCoupon() async {
    return _apiClient.delete<BackendCart>(
      '/cart/coupon',
      fromJson: (data) => BackendCart.fromJson(data),
    );
  }
}

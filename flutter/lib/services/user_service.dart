import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';
import 'package:flutter_mobile_app/models/address.dart';
import 'package:flutter_mobile_app/models/product.dart';

class UserService {
  final ApiClient _apiClient;

  UserService(this._apiClient);

  // ── Addresses ──────────────────────────────────────────────

  Future<ApiResult<List<Address>>> getAddresses() async {
    return _apiClient.get<List<Address>>(
      '/users/addresses',
      fromJson: (data) =>
          (data as List).map((a) => Address.fromJson(a)).toList(),
    );
  }

  Future<ApiResult<Address>> addAddress(Address address) async {
    return _apiClient.post<Address>(
      '/users/addresses',
      data: address.toJson(),
      fromJson: (data) => Address.fromJson(data),
    );
  }

  Future<ApiResult<Address>> updateAddress(String addressId, Address address) async {
    return _apiClient.put<Address>(
      '/users/addresses/$addressId',
      data: address.toJson(),
      fromJson: (data) => Address.fromJson(data),
    );
  }

  Future<ApiResult<void>> deleteAddress(String addressId) async {
    return _apiClient.delete<void>(
      '/users/addresses/$addressId',
      fromJson: (_) {},
    );
  }

  // ── Wishlist ───────────────────────────────────────────────

  Future<ApiResult<List<Product>>> getWishlist() async {
    return _apiClient.get<List<Product>>(
      '/users/wishlist',
      fromJson: (data) {
        if (data is Map && data['wishlist'] != null) {
          return (data['wishlist'] as List)
              .map((p) => Product.fromJson(p))
              .toList();
        }
        if (data is List) {
          return data.map((p) => Product.fromJson(p)).toList();
        }
        return [];
      },
    );
  }

  Future<ApiResult<void>> addToWishlist(String productId) async {
    return _apiClient.post<void>(
      '/users/wishlist',
      data: {'productId': productId},
      fromJson: (_) {},
    );
  }

  Future<ApiResult<void>> removeFromWishlist(String productId) async {
    return _apiClient.delete<void>(
      '/users/wishlist/$productId',
      fromJson: (_) {},
    );
  }

  Future<ApiResult<void>> toggleWishlistPrivacy() async {
    return _apiClient.put<void>(
      '/users/wishlist/share',
      fromJson: (_) {},
    );
  }

  // ── Push Token ─────────────────────────────────────────────

  Future<ApiResult<void>> savePushToken(String token) async {
    return _apiClient.post<void>(
      '/users/push-token',
      data: {'token': token},
      fromJson: (_) {},
    );
  }
}

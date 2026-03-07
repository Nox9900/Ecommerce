import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';
import 'package:flutter_mobile_app/models/order.dart';

class OrderService {
  final ApiClient _apiClient;

  OrderService(this._apiClient);

  Future<ApiResult<Order>> createOrder({
    required List<Map<String, dynamic>> orderItems,
    required ShippingAddress shippingAddress,
    required double totalPrice,
    String? couponCode,
  }) async {
    return _apiClient.post<Order>(
      '/orders',
      data: {
        'orderItems': orderItems,
        'shippingAddress': shippingAddress.toJson(),
        'totalPrice': totalPrice,
        if (couponCode != null) 'couponCode': couponCode,
      },
      fromJson: (data) => Order.fromJson(data),
    );
  }

  Future<ApiResult<List<Order>>> getUserOrders() async {
    return _apiClient.get<List<Order>>(
      '/orders',
      fromJson: (data) {
        if (data is List) {
          return data.map((o) => Order.fromJson(o)).toList();
        }
        if (data is Map && data['orders'] != null) {
          return (data['orders'] as List).map((o) => Order.fromJson(o)).toList();
        }
        return [];
      },
    );
  }
}

import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/order.dart';
import '../services/api_service.dart';

class OrderProvider extends ChangeNotifier {
  final ApiService _api;

  List<Order> _orders = [];
  Order? _selectedOrder;
  bool _loading = false;
  String? _error;

  OrderProvider(this._api);

  List<Order> get orders => _orders;
  Order? get selectedOrder => _selectedOrder;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchOrders() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.get(ApiConfig.orders);
      final results =
          (data['results'] as List).map((e) => Order.fromJson(e)).toList();
      _orders = results;
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchOrder(int id) async {
    _loading = true;
    notifyListeners();
    try {
      final data = await _api.get('${ApiConfig.orders}$id/');
      _selectedOrder = Order.fromJson(data);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<Order?> placeOrder(Map<String, dynamic> orderData) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.post(ApiConfig.orders, body: orderData);
      final order = Order.fromJson(data);
      _orders.insert(0, order);
      _loading = false;
      notifyListeners();
      return order;
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }
}
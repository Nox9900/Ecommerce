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
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;

  OrderProvider(this._api);

  List<Order> get orders => _orders;
  Order? get selectedOrder => _selectedOrder;
  bool get loading => _loading;
  String? get error => _error;
  bool get hasMore => _hasMore;

  /// Fetch orders from GET /api/orders.
  /// Backend returns: { orders: [], total, page, pages }
  Future<void> fetchOrders({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _orders = [];
    }

    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.get(ApiConfig.orders, queryParams: {
        'page': '$_currentPage',
        'limit': '${ApiConfig.pageSize}',
      });

      List<Order> results = [];
      if (data is Map) {
        final list = data['orders'] as List? ?? [];
        results = list.map((e) => Order.fromJson(e)).toList();
        _totalPages = data['pages'] ?? 1;
        _hasMore = _currentPage < _totalPages;
      }

      if (refresh) {
        _orders = results;
      } else {
        _orders.addAll(results);
      }

      if (_hasMore) _currentPage++;
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Place a new order: POST /api/orders
  Future<Order?> placeOrder(Map<String, dynamic> orderData) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.post(ApiConfig.orders, body: orderData);
      final order = Order.fromJson(data['order'] ?? data);
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
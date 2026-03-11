import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/vendor.dart';
import '../models/quote.dart';
import '../services/api_service.dart';

class VendorProvider extends ChangeNotifier {
  final ApiService _api;

  List<Vendor> _vendors = [];
  Vendor? _selectedVendor;
  List<Shop> _shops = [];
  List<Shop> _randomShops = [];
  bool _loading = false;
  String? _error;
  String _searchQuery = '';

  VendorProvider(this._api);

  List<Vendor> get vendors => _vendors;
  Vendor? get selectedVendor => _selectedVendor;
  List<Shop> get shops => _shops;
  List<Shop> get randomShops => _randomShops;
  bool get loading => _loading;
  String? get error => _error;

  /// Fetch a vendor's public profile: GET /api/vendors/:id
  Future<void> fetchVendor(String id) async {
    _loading = true;
    _selectedVendor = null;
    notifyListeners();
    try {
      final data = await _api.get(ApiConfig.vendor(id));
      _selectedVendor = Vendor.fromJson(data);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Fetch random shops: GET /api/shops/random
  Future<void> fetchRandomShops() async {
    try {
      final data = await _api.get(ApiConfig.randomShops);
      if (data is List) {
        _randomShops = data.map((e) => Shop.fromJson(e)).toList();
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Fetch shop details: GET /api/shops/:id
  /// Returns { shop: {...}, products: [...], total, page, pages }
  Future<Map<String, dynamic>?> fetchShopDetails(String id) async {
    _loading = true;
    notifyListeners();
    try {
      final data = await _api.get(ApiConfig.shop(id));
      _loading = false;
      notifyListeners();
      return data;
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  void setSearch(String query) {
    _searchQuery = query;
    fetchVendors();
  }

  /// Fetch vendors list: GET /api/vendors
  Future<void> fetchVendors() async {
    _loading = true;
    notifyListeners();
    try {
      final params = <String, String>{};
      if (_searchQuery.isNotEmpty) params['q'] = _searchQuery;
      final data = await _api.get(ApiConfig.vendors, queryParams: params);
      if (data is List) {
        _vendors = data.map((e) => Vendor.fromJson(e)).toList();
      } else if (data is Map && data['vendors'] is List) {
        _vendors = (data['vendors'] as List).map((e) => Vendor.fromJson(e)).toList();
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
}

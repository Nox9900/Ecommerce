import 'package:flutter/material.dart';
import '../config/api_config.dart';
import '../models/vendor.dart';
import '../services/api_service.dart';

class VendorProvider extends ChangeNotifier {
  final ApiService _api;

  List<Vendor> _vendors = [];
  Vendor? _selectedVendor;
  bool _loading = false;
  String? _error;
  String _searchQuery = '';

  VendorProvider(this._api);

  List<Vendor> get vendors => _vendors;
  Vendor? get selectedVendor => _selectedVendor;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchVendors({bool refresh = false}) async {
    if (_loading) return;
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final params = <String, String>{};
      if (_searchQuery.isNotEmpty) params['search'] = _searchQuery;

      final data = await _api.get(ApiConfig.vendors, queryParams: params);
      final results =
          (data['results'] as List).map((e) => Vendor.fromJson(e)).toList();
      _vendors = results;
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> fetchVendor(int id) async {
    _loading = true;
    _selectedVendor = null;
    notifyListeners();
    try {
      final data = await _api.get('${ApiConfig.vendors}$id/');
      _selectedVendor = Vendor.fromJson(data);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
    }
  }

  void setSearch(String query) {
    _searchQuery = query;
    fetchVendors(refresh: true);
  }
}

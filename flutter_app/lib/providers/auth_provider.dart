import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api;

  User? _user;
  String? _token;
  bool _loading = false;
  String? _error;

  AuthProvider(this._api);

  ApiService get api => _api;
  User? get user => _user;
  String? get token => _token;
  bool get isLoggedIn => _token != null;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    if (_token != null) {
      _api.setToken(_token);
      try {
        await fetchProfile();
      } catch (_) {
        await logout();
      }
    }
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.post(ApiConfig.login, body: {
        'username': username,
        'password': password,
      });
      _token = data['token'];
      _api.setToken(_token);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);

      await fetchProfile();
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String username,
    required String email,
    required String password,
    String? companyName,
    String? phone,
    String firstName = '',
    String lastName = '',
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.post(ApiConfig.register, body: {
        'username': username,
        'email': email,
        'password': password,
        'confirm_password': password,
        'first_name': firstName,
        'last_name': lastName,
        if (companyName != null) 'company_name': companyName,
        if (phone != null) 'phone': phone,
      });

      _token = data['token'];
      _user = User.fromJson(data['user']);
      _api.setToken(_token);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);

      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchProfile() async {
    final data = await _api.get(ApiConfig.profile);
    _user = User.fromJson(data);
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> fields) async {
    try {
      final data = await _api.patch(ApiConfig.profile, body: fields);
      _user = User.fromJson(data);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    // Invalidate server-side token (best-effort)
    try {
      if (_token != null) {
        await _api.post(ApiConfig.logout);
      }
    } catch (_) {}
    _token = null;
    _user = null;
    _api.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

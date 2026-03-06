import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_mobile_app/core/api_client.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  String? _token;
  bool _isLoading = false;
  Map<String, dynamic>? _user;

  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get user => _user;

  AuthProvider(this._apiClient) {
    _loadToken();
  }

  Future<void> _loadToken() async {
    _token = await _storage.read(key: 'auth_token');
    notifyListeners();
  }

  Future<void> login(String token, Map<String, dynamic> userData) async {
    _isLoading = true;
    notifyListeners();

    try {
      _token = token;
      _user = userData;
      await _storage.write(key: 'auth_token', value: token);
    } catch (e) {
      ApiClient.debugPrint('Login storage error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post('/auth/register', data: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        // Handle success (e.g., set pending verification if backend requires it)
      }
    } catch (e) {
      ApiClient.debugPrint('SignUp error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> resetPassword(String email) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiClient.dio.post('/auth/forgot-password', data: {'email': email});
    } catch (e) {
      ApiClient.debugPrint('Forgot password error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await _storage.delete(key: 'auth_token');
    notifyListeners();
  }
}

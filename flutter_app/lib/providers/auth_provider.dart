import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/clerk_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api;
  final ClerkService _clerk = ClerkService();

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

  /// Restore session from stored token on app start.
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

  /// Sign in with Google using the backend's Clerk-based auth flow.
  ///
  /// Flow:
  /// 1. Google Sign-In → get ID token
  /// 2. POST /api/auth/google with the ID token → Clerk sign-in token
  /// 3. Exchange sign-in token for Clerk session JWT via Clerk Frontend API
  /// 4. Use the session JWT as Bearer token for all subsequent API calls
  Future<bool> signInWithGoogle() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      // Step 1: Google Sign-In
      final googleSignIn = GoogleSignIn(
        clientId: ApiConfig.googleClientId,
        scopes: ['email', 'profile'],
      );
      final account = await googleSignIn.signIn();
      if (account == null) {
        _loading = false;
        _error = 'Google sign-in was cancelled.';
        notifyListeners();
        return false;
      }

      final googleAuth = await account.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) {
        _loading = false;
        _error = 'Failed to get Google ID token.';
        notifyListeners();
        return false;
      }

      // Step 2: Send to backend → get Clerk sign-in token
      final data = await _api.post(ApiConfig.googleSignIn, body: {
        'idToken': idToken,
        'email': account.email,
        'firstName': account.displayName?.split(' ').first ?? '',
        'lastName': account.displayName?.split(' ').skip(1).join(' ') ?? '',
      });

      final signInToken = data['token'] as String?;
      if (signInToken == null) {
        _loading = false;
        _error = 'Failed to get sign-in token from server.';
        notifyListeners();
        return false;
      }

      // Step 3: Exchange for Clerk session JWT
      final sessionJwt =
          await _clerk.createSessionFromSignInToken(signInToken);
      if (sessionJwt == null) {
        _loading = false;
        _error = 'Failed to create session. Check Clerk configuration.';
        notifyListeners();
        return false;
      }

      // Step 4: Store and use the session JWT
      _token = sessionJwt;
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

  /// Fetch the current user's profile from GET /api/users/me.
  Future<void> fetchProfile() async {
    final data = await _api.get(ApiConfig.me);
    _user = User.fromJson(data);
    notifyListeners();
  }

  /// Sign out and clear all stored tokens.
  Future<void> logout() async {
    _token = null;
    _user = null;
    _api.setToken(null);
    _clerk.clearSession();

    // Disconnect Google Sign-In
    try {
      final googleSignIn = GoogleSignIn();
      await googleSignIn.signOut();
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Update the user's profile via PUT /api/users/me.
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final result = await _api.put(ApiConfig.me, body: data);
      _user = User.fromJson(result);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}

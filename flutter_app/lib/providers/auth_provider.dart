import 'package:flutter/foundation.dart' show kIsWeb;
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

  // ─── helpers ───────────────────────────────────────────────

  /// Exchange a Clerk sign-in token for a session JWT, persist it,
  /// and fetch the user profile.
  Future<bool> _handleSignInToken(String signInToken) async {
    final sessionJwt =
        await _clerk.createSessionFromSignInToken(signInToken);
    if (sessionJwt == null) {
      _error = 'Failed to create session.';
      return false;
    }

    _token = sessionJwt;
    _api.setToken(_token);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', _token!);

    await fetchProfile();
    return true;
  }

  // ─── email / password ──────────────────────────────────────

  /// Sign in with email and password.
  Future<bool> signInWithEmail({
    required String email,
    required String password,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.post(ApiConfig.login, body: {
        'email': email,
        'password': password,
      });

      final signInToken = data['token'] as String?;
      if (signInToken == null) {
        _loading = false;
        _error = 'Login succeeded but failed to get token.';
        notifyListeners();
        return false;
      }

      final ok = await _handleSignInToken(signInToken);
      _loading = false;
      notifyListeners();
      return ok;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  /// Register a new account with email and password.
  Future<bool> registerWithEmail({
    required String email,
    required String password,
    String firstName = '',
    String lastName = '',
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.post(ApiConfig.register, body: {
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
      });

      final signInToken = data['token'] as String?;
      if (signInToken == null) {
        _loading = false;
        _error = 'Registration succeeded but failed to get token.';
        notifyListeners();
        return false;
      }

      final ok = await _handleSignInToken(signInToken);
      _loading = false;
      notifyListeners();
      return ok;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  // ─── google sign-in ────────────────────────────────────────

  /// Sign in (or sign up) with Google.
  Future<bool> signInWithGoogle() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      // On Web/iOS: pass clientId (Web client ID) so the plugin can identify the app.
      // On Android: don't pass clientId (it uses google-services.json instead);
      //             pass serverClientId (Web client ID) so Google returns an idToken.
      final googleSignIn = GoogleSignIn(
        clientId: kIsWeb ? ApiConfig.googleWebClientId : null,
        serverClientId: kIsWeb ? null : ApiConfig.googleWebClientId,
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

      final ok = await _handleSignInToken(signInToken);
      _loading = false;
      notifyListeners();
      return ok;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  // ─── forgot password ───────────────────────────────────────

  /// Request a password-reset email.
  Future<bool> forgotPassword(String email) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.post(ApiConfig.forgotPassword, body: {'email': email});
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

  // ─── profile ───────────────────────────────────────────────

  Future<void> fetchProfile() async {
    final data = await _api.get(ApiConfig.me);
    _user = User.fromJson(data);
    notifyListeners();
  }

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

  // ─── logout ────────────────────────────────────────────────

  Future<void> logout() async {
    _token = null;
    _user = null;
    _api.setToken(null);
    _clerk.clearSession();

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
}

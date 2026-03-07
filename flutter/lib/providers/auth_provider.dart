import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/env.dart';
import 'package:flutter_mobile_app/models/user.dart';
import 'package:flutter_mobile_app/services/clerk_auth_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final ClerkAuthService _clerkAuth = ClerkAuthService();

  String? _token;
  String? _sessionId;
  bool _isLoading = false;
  String? _error;
  AppUser? _user;
  String? _phoneVerificationId;
  bool _isPhoneSignUp = false;

  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  String? get error => _error;
  AppUser? get user => _user;

  AuthProvider(this._apiClient) {
    _loadSession();
  }

  Future<void> _loadSession() async {
    _token = await _storage.read(key: 'auth_token');
    _sessionId = await _storage.read(key: 'clerk_session_id');
    if (_token != null) {
      // Fetch user profile from backend on app start
      await _fetchUserProfile();
    }
    notifyListeners();
  }

  Future<void> _fetchUserProfile() async {
    try {
      final response = await _apiClient.dio.get('/users/me');
      if (response.data != null) {
        _user = AppUser.fromJson(response.data);
      }
    } catch (e) {
      // Token might be expired — try refreshing, or clear session
      ApiClient.debugPrint('Failed to fetch user profile: $e');
      if (_sessionId != null) {
        await _refreshToken();
      }
    }
  }

  Future<void> _refreshToken() async {
    if (_sessionId == null) return;
    try {
      final newToken = await _clerkAuth.getSessionToken(_sessionId!);
      if (newToken != null) {
        _token = newToken;
        await _storage.write(key: 'auth_token', value: newToken);
        await _fetchUserProfile();
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  }

  /// Sign in with Clerk email+password authentication.
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _clerkAuth.signIn(email: email, password: password);

      if (result.needsVerification) {
        _error = 'Email verification required. Please check your email.';
        return;
      }

      if (result.sessionId != null) {
        _sessionId = result.sessionId;
        await _storage.write(key: 'clerk_session_id', value: _sessionId);

        // Get JWT token for API calls
        final jwt = await _clerkAuth.getSessionToken(result.sessionId!);
        if (jwt != null) {
          _token = jwt;
          await _storage.write(key: 'auth_token', value: jwt);
          await _fetchUserProfile();
        }
      }
    } on ClerkAuthException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Sign in failed. Please try again.';
      ApiClient.debugPrint('SignIn error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Sign up with Clerk.
  Future<void> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _clerkAuth.signUp(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
      );

      if (result.needsVerification) {
        // User needs to verify email — this is expected with Clerk
        return;
      }

      if (result.sessionId != null) {
        _sessionId = result.sessionId;
        await _storage.write(key: 'clerk_session_id', value: _sessionId);

        final jwt = await _clerkAuth.getSessionToken(result.sessionId!);
        if (jwt != null) {
          _token = jwt;
          await _storage.write(key: 'auth_token', value: jwt);
          await _fetchUserProfile();
        }
      }
    } on ClerkAuthException catch (e) {
      _error = e.message;
      rethrow;
    } catch (e) {
      _error = 'Sign up failed. Please try again.';
      ApiClient.debugPrint('SignUp error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Request password reset via Clerk.
  Future<void> resetPassword(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _clerkAuth.resetPassword(email);
    } on ClerkAuthException catch (e) {
      _error = e.message;
      rethrow;
    } catch (e) {
      _error = 'Password reset failed. Please try again.';
      ApiClient.debugPrint('Forgot password error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Sign in with Google.
  Future<void> signInWithGoogle() async {
    _error = null;
    notifyListeners();

    try {
      final googleSignIn = GoogleSignIn(
        serverClientId: Env.googleClientId,
      );

      final account = await googleSignIn.signIn();
      if (account == null) return; // User cancelled

      // Show loading after Google dialog completes
      _isLoading = true;
      notifyListeners();

      final authentication = await account.authentication;
      final idToken = authentication.idToken;

      if (idToken == null) {
        throw Exception('Failed to get Google ID token');
      }

      // Exchange Google token for Clerk sign-in token via backend
      final response = await _apiClient.dio.post('/auth/google', data: {
        'idToken': idToken,
        'email': account.email,
        'firstName': account.displayName?.split(' ').first ?? '',
        'lastName': account.displayName?.split(' ').skip(1).join(' ') ?? '',
        'photoUrl': account.photoUrl,
      });

      final signInToken = response.data['token'] as String;

      // Use ticket strategy with Clerk
      final result = await _clerkAuth.signInWithTicket(signInToken);

      if (result.sessionId != null) {
        _sessionId = result.sessionId;
        await _storage.write(key: 'clerk_session_id', value: _sessionId);

        final jwt = await _clerkAuth.getSessionToken(result.sessionId!);
        if (jwt != null) {
          _token = jwt;
          await _storage.write(key: 'auth_token', value: jwt);
          await _fetchUserProfile();
        }
      }
    } catch (e) {
      _error = 'Google sign in failed. Please try again.';
      ApiClient.debugPrint('Google SignIn error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Start phone sign-in/sign-up. Sends OTP.
  /// Returns true if OTP was sent successfully.
  Future<bool> startPhoneSignIn(String phoneNumber) async {
    _isLoading = true;
    _error = null;
    _isPhoneSignUp = false;
    notifyListeners();

    try {
      try {
        _phoneVerificationId = await _clerkAuth.startPhoneSignIn(phoneNumber);
        _isPhoneSignUp = false;
      } on ClerkUserNotFoundException {
        // User doesn't exist — try sign-up instead
        _phoneVerificationId = await _clerkAuth.startPhoneSignUp(phoneNumber);
        _isPhoneSignUp = true;
      }
      return true;
    } on ClerkAuthException catch (e) {
      _error = e.message;
      return false;
    } catch (e) {
      _error = 'Failed to send verification code. Please try again.';
      ApiClient.debugPrint('Phone SignIn error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Verify phone OTP code.
  Future<void> verifyPhoneCode(String code) async {
    if (_phoneVerificationId == null) {
      _error = 'No pending verification. Please try again.';
      notifyListeners();
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      ClerkAuthResult result;
      if (_isPhoneSignUp) {
        result = await _clerkAuth.verifyPhoneSignUp(_phoneVerificationId!, code);
      } else {
        result = await _clerkAuth.verifyPhoneSignIn(_phoneVerificationId!, code);
      }

      if (result.sessionId != null) {
        _sessionId = result.sessionId;
        await _storage.write(key: 'clerk_session_id', value: _sessionId);

        final jwt = await _clerkAuth.getSessionToken(result.sessionId!);
        if (jwt != null) {
          _token = jwt;
          await _storage.write(key: 'auth_token', value: jwt);
          await _fetchUserProfile();
        }
      }
      _phoneVerificationId = null;
    } on ClerkAuthException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Verification failed. Please try again.';
      ApiClient.debugPrint('Phone verification error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _sessionId = null;
    _user = null;
    _error = null;
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'clerk_session_id');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}

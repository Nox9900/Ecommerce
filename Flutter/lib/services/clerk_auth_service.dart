import 'package:dio/dio.dart';
import 'package:flutter_mobile_app/core/env.dart';

/// Clerk authentication service using Clerk's Frontend API.
/// This handles sign-up, sign-in, and session management
/// since there's no official Clerk Flutter SDK.
class ClerkAuthService {
  final Dio _dio;

  ClerkAuthService()
      : _dio = Dio(
          BaseOptions(
            baseUrl: 'https://api.clerk.com/v1',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ${Env.clerkPublishableKey}',
            },
          ),
        );

  /// Sign up with email and password using Clerk's Frontend/Client API.
  /// Returns the sign-up object with session info.
  Future<ClerkAuthResult> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    try {
      // Step 1: Create sign-up
      final response = await _dio.post(
        '/client/sign_ups',
        data: {
          'first_name': firstName,
          'last_name': lastName,
          'email_address': email,
          'password': password,
        },
      );

      final data = response.data;

      // If sign-up creates a session immediately
      if (data['created_session_id'] != null) {
        return ClerkAuthResult(
          sessionId: data['created_session_id'],
          userId: data['id'],
        );
      }

      // Email verification might be required
      return ClerkAuthResult(
        userId: data['id'],
        needsVerification: true,
      );
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Sign up failed');
      }
      throw ClerkAuthException('Sign up failed: ${e.message}');
    }
  }

  /// Sign in with email and password.
  Future<ClerkAuthResult> signIn({
    required String email,
    required String password,
  }) async {
    try {
      // Step 1: Create sign-in attempt
      final signInResponse = await _dio.post(
        '/client/sign_ins',
        data: {
          'identifier': email,
          'password': password,
        },
      );

      final data = signInResponse.data;

      if (data['created_session_id'] != null) {
        return ClerkAuthResult(
          sessionId: data['created_session_id'],
          userId: data['created_user_id'] ?? data['id'],
        );
      }

      // Multi-factor might be required
      return ClerkAuthResult(
        userId: data['id'],
        needsVerification: true,
      );
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Sign in failed');
      }
      throw ClerkAuthException('Sign in failed: ${e.message}');
    }
  }

  /// Sign in with a Clerk ticket (sign-in token).
  Future<ClerkAuthResult> signInWithTicket(String ticket) async {
    try {
      final response = await _dio.post(
        '/client/sign_ins',
        data: {
          'strategy': 'ticket',
          'ticket': ticket,
        },
      );
      final data = response.data;
      if (data['created_session_id'] != null) {
        return ClerkAuthResult(
          sessionId: data['created_session_id'],
          userId: data['created_user_id'] ?? data['id'],
        );
      }
      throw ClerkAuthException('Ticket sign-in did not create a session');
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Ticket sign-in failed');
      }
      throw ClerkAuthException('Ticket sign-in failed: ${e.message}');
    }
  }

  /// Get a session token (JWT) for making authenticated API requests.
  Future<String?> getSessionToken(String sessionId) async {
    try {
      final response = await _dio.post('/client/sessions/$sessionId/tokens');
      return response.data['jwt'];
    } on DioException {
      return null;
    }
  }

  /// Request password reset email via Clerk.
  Future<void> resetPassword(String email) async {
    try {
      await _dio.post(
        '/client/sign_ins',
        data: {
          'identifier': email,
          'strategy': 'reset_password_email_code',
        },
      );
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? 'Password reset failed');
      }
      throw ClerkAuthException('Password reset failed');
    }
  }

  /// Start phone sign-in: creates sign-in attempt and sends OTP.
  Future<String> startPhoneSignIn(String phoneNumber) async {
    try {
      final response = await _dio.post(
        '/client/sign_ins',
        data: {'identifier': phoneNumber},
      );
      final signInId = response.data['id'] as String;

      await _dio.post(
        '/client/sign_ins/$signInId/prepare_first_factor',
        data: {'strategy': 'phone_code'},
      );

      return signInId;
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        final code = errors[0]['code'];
        if (code == 'form_identifier_not_found') {
          throw ClerkUserNotFoundException('No account found with this phone number');
        }
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Phone sign in failed');
      }
      throw ClerkAuthException('Phone sign in failed: ${e.message}');
    }
  }

  /// Start phone sign-up: creates sign-up and sends OTP.
  Future<String> startPhoneSignUp(String phoneNumber) async {
    try {
      final response = await _dio.post(
        '/client/sign_ups',
        data: {'phone_number': phoneNumber},
      );
      final signUpId = response.data['id'] as String;

      await _dio.post(
        '/client/sign_ups/$signUpId/prepare_verification',
        data: {'strategy': 'phone_code'},
      );

      return signUpId;
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Phone sign up failed');
      }
      throw ClerkAuthException('Phone sign up failed: ${e.message}');
    }
  }

  /// Verify phone OTP for sign-in.
  Future<ClerkAuthResult> verifyPhoneSignIn(String signInId, String code) async {
    try {
      final response = await _dio.post(
        '/client/sign_ins/$signInId/attempt_first_factor',
        data: {'strategy': 'phone_code', 'code': code},
      );
      final data = response.data;
      if (data['created_session_id'] != null) {
        return ClerkAuthResult(
          sessionId: data['created_session_id'],
          userId: data['created_user_id'] ?? data['id'],
        );
      }
      throw ClerkAuthException('Verification did not create a session');
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Verification failed');
      }
      throw ClerkAuthException('Verification failed: ${e.message}');
    }
  }

  /// Verify phone OTP for sign-up.
  Future<ClerkAuthResult> verifyPhoneSignUp(String signUpId, String code) async {
    try {
      final response = await _dio.post(
        '/client/sign_ups/$signUpId/attempt_verification',
        data: {'strategy': 'phone_code', 'code': code},
      );
      final data = response.data;
      if (data['created_session_id'] != null) {
        return ClerkAuthResult(
          sessionId: data['created_session_id'],
          userId: data['created_user_id'] ?? data['id'],
        );
      }
      throw ClerkAuthException('Verification did not create a session');
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      if (errors is List && errors.isNotEmpty) {
        throw ClerkAuthException(errors[0]['long_message'] ?? errors[0]['message'] ?? 'Verification failed');
      }
      throw ClerkAuthException('Verification failed: ${e.message}');
    }
    }
  }

  // ...existing code...

class ClerkAuthResult {
  final String? sessionId;
  final String? userId;
  final bool needsVerification;

  ClerkAuthResult({
    this.sessionId,
    this.userId,
    this.needsVerification = false,
  });
}

class ClerkAuthException implements Exception {
  final String message;
  ClerkAuthException(this.message);

  @override
  String toString() => message;
}

class ClerkUserNotFoundException extends ClerkAuthException {
  ClerkUserNotFoundException(super.message);
}

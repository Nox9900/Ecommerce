import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

/// Service to interact with Clerk's Frontend API for session management.
/// Since there's no official Clerk Flutter SDK, we use the REST Frontend API.
class ClerkService {
  String? _sessionToken;
  String? _clientId;

  String? get sessionToken => _sessionToken;

  /// Extract the Clerk Frontend API URL from the publishable key.
  /// Clerk publishable keys encode the FAPI domain in base64 after the prefix.
  String get _fapiBaseUrl {
    final key = ApiConfig.clerkPublishableKey;
    // pk_test_<base64> or pk_live_<base64>
    final parts = key.split('_');
    if (parts.length >= 3) {
      final encoded = parts.sublist(2).join('_');
      // Remove trailing $ that Clerk adds
      final cleaned = encoded.endsWith('\$')
          ? encoded.substring(0, encoded.length - 1)
          : encoded;
      try {
        final decoded = utf8.decode(base64Decode(cleaned));
        return 'https://$decoded';
      } catch (_) {
        // Fallback: user must set this manually
      }
    }
    // If parsing fails, use a default pattern
    return 'https://clerk.${ApiConfig.clerkPublishableKey}';
  }

  /// Exchange a Clerk sign-in token (ticket) for a session JWT.
  ///
  /// Flow:
  /// 1. POST to Clerk FAPI /v1/client/sign_ins with ticket strategy
  /// 2. Extract session token from the response
  Future<String?> createSessionFromSignInToken(String signInToken) async {
    try {
      final response = await http.post(
        Uri.parse('$_fapiBaseUrl/v1/client/sign_ins'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${ApiConfig.clerkPublishableKey}',
        },
        body: jsonEncode({
          'strategy': 'ticket',
          'ticket': signInToken,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);

        // The response contains a client object with sessions
        final client = data['client'];
        if (client != null) {
          _clientId = client['id'];
          final sessions = client['sessions'] as List?;
          if (sessions != null && sessions.isNotEmpty) {
            final activeSession = sessions.first;
            // Get the JWT from the last active token
            final lastActiveToken = activeSession['last_active_token'];
            if (lastActiveToken != null) {
              _sessionToken = lastActiveToken['jwt'];
              return _sessionToken;
            }
          }
        }

        // Alternative: check response.response for created_session_id
        final responseObj = data['response'];
        if (responseObj != null) {
          final createdSessionId = responseObj['created_session_id'];
          if (createdSessionId != null) {
            return await _getSessionToken(createdSessionId);
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Refresh the session token by fetching a new JWT from the active session.
  Future<String?> refreshToken() async {
    if (_clientId == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$_fapiBaseUrl/v1/client'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.clerkPublishableKey}',
          if (_sessionToken != null) 'Cookie': '__session=$_sessionToken',
        },
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        final sessions = data['response']?['sessions'] as List?;
        if (sessions != null && sessions.isNotEmpty) {
          final token = sessions.first['last_active_token']?['jwt'];
          if (token != null) {
            _sessionToken = token;
            return token;
          }
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Get session token by session ID.
  Future<String?> _getSessionToken(String sessionId) async {
    try {
      final response = await http.post(
        Uri.parse('$_fapiBaseUrl/v1/client/sessions/$sessionId/tokens'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${ApiConfig.clerkPublishableKey}',
        },
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        _sessionToken = data['jwt'];
        return _sessionToken;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  void clearSession() {
    _sessionToken = null;
    _clientId = null;
  }
}

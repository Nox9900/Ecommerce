import 'dart:convert';
import 'package:http/http.dart' as http;

/// Callback type for handling 401 unauthorized responses.
typedef OnUnauthorized = void Function();

/// Central HTTP service for communicating with the Node.js/Express backend.
/// Uses Bearer token authentication (Clerk JWT).
class ApiService {
  String? _token;
  OnUnauthorized? onUnauthorized;

  void setToken(String? token) => _token = token;
  String? get token => _token;

  Map<String, String> get _headers {
    final h = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_token != null) h['Authorization'] = 'Bearer $_token';
    return h;
  }

  Future<dynamic> get(String url, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse(url).replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);
    return _handleResponse(response);
  }

  Future<dynamic> post(String url, {Map<String, dynamic>? body}) async {
    final response = await http.post(
      Uri.parse(url),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<dynamic> put(String url, {Map<String, dynamic>? body}) async {
    final response = await http.put(
      Uri.parse(url),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<dynamic> patch(String url, {Map<String, dynamic>? body}) async {
    final response = await http.patch(
      Uri.parse(url),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<dynamic> delete(String url, {Map<String, dynamic>? body}) async {
    final response = await http.delete(
      Uri.parse(url),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    if (response.statusCode == 204) return null;
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      onUnauthorized?.call();
      throw ApiException('Unauthorized – please log in again.', 401);
    } else if (response.statusCode == 403) {
      throw ApiException('Access denied.', 403);
    } else if (response.statusCode == 404) {
      throw ApiException('Resource not found.', 404);
    } else {
      String msg = 'Something went wrong (${response.statusCode})';
      try {
        final body = jsonDecode(response.body);
        if (body is Map) {
          if (body.containsKey('message')) {
            msg = body['message'].toString();
          } else if (body.containsKey('error')) {
            msg = body['error'].toString();
          }
        }
      } catch (_) {}
      throw ApiException(msg, response.statusCode);
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);

  @override
  String toString() => message;
}

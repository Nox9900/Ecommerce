import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_mobile_app/core/env.dart';
import 'package:flutter_mobile_app/core/api_result.dart';

class ApiClient {
  static String get baseUrl => Env.apiBaseUrl;
  static String get socketUrl => Env.socketUrl;

  final Dio dio;
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  ApiClient()
      : dio = Dio(
          BaseOptions(
            baseUrl: Env.apiBaseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          debugPrint('API Error: ${e.response?.statusCode} - ${e.message}');
          return handler.next(e);
        },
      ),
    );
  }

  /// Generic GET with error handling
  Future<ApiResult<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.get(path, queryParameters: queryParameters);
      return ApiResult.success(fromJson(response.data), statusCode: response.statusCode);
    } on DioException catch (e) {
      return ApiResult.failure(
        _extractError(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Generic POST with error handling
  Future<ApiResult<T>> post<T>(
    String path, {
    dynamic data,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.post(path, data: data);
      return ApiResult.success(fromJson(response.data), statusCode: response.statusCode);
    } on DioException catch (e) {
      return ApiResult.failure(
        _extractError(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Generic PUT with error handling
  Future<ApiResult<T>> put<T>(
    String path, {
    dynamic data,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.put(path, data: data);
      return ApiResult.success(fromJson(response.data), statusCode: response.statusCode);
    } on DioException catch (e) {
      return ApiResult.failure(
        _extractError(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// Generic DELETE with error handling
  Future<ApiResult<T>> delete<T>(
    String path, {
    dynamic data,
    required T Function(dynamic data) fromJson,
  }) async {
    try {
      final response = await dio.delete(path, data: data);
      return ApiResult.success(fromJson(response.data), statusCode: response.statusCode);
    } on DioException catch (e) {
      return ApiResult.failure(
        _extractError(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  String _extractError(DioException e) {
    if (e.response?.data is Map) {
      return (e.response!.data as Map)['message'] ?? e.message ?? 'Unknown error';
    }
    if (e.type == DioExceptionType.connectionTimeout) {
      return 'Connection timed out. Please check your internet.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Unable to connect to server. Please check your internet.';
    }
    return e.message ?? 'An unexpected error occurred';
  }

  static void debugPrint(String message) {
    print('[ApiClient] $message');
  }
}

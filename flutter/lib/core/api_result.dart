/// Result wrapper for API calls with proper error handling.
class ApiResult<T> {
  final T? data;
  final String? error;
  final int? statusCode;

  ApiResult._({this.data, this.error, this.statusCode});

  factory ApiResult.success(T data, {int? statusCode}) =>
      ApiResult._(data: data, statusCode: statusCode);

  factory ApiResult.failure(String error, {int? statusCode}) =>
      ApiResult._(error: error, statusCode: statusCode);

  bool get isSuccess => error == null;
  bool get isFailure => error != null;
}

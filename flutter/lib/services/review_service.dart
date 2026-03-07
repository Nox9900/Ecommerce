import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';
import 'package:flutter_mobile_app/models/review.dart';

class ReviewService {
  final ApiClient _apiClient;

  ReviewService(this._apiClient);

  Future<ApiResult<List<Review>>> getProductReviews(String productId) async {
    return _apiClient.get<List<Review>>(
      '/reviews/product/$productId',
      fromJson: (data) {
        if (data is List) {
          return data.map((r) => Review.fromJson(r)).toList();
        }
        if (data is Map && data['reviews'] != null) {
          return (data['reviews'] as List).map((r) => Review.fromJson(r)).toList();
        }
        return [];
      },
    );
  }

  Future<ApiResult<Review>> createReview({
    required String productId,
    required String orderId,
    required int rating,
    String? comment,
  }) async {
    return _apiClient.post<Review>(
      '/reviews',
      data: {
        'productId': productId,
        'orderId': orderId,
        'rating': rating,
        if (comment != null) 'comment': comment,
      },
      fromJson: (data) => Review.fromJson(data),
    );
  }

  Future<ApiResult<void>> deleteReview(String reviewId) async {
    return _apiClient.delete<void>(
      '/reviews/$reviewId',
      fromJson: (_) {},
    );
  }
}

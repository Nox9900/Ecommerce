import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';

class PaymentService {
  final ApiClient _apiClient;

  PaymentService(this._apiClient);

  /// Creates a Stripe payment intent.
  /// Returns the clientSecret for the Stripe SDK to handle payment.
  Future<ApiResult<PaymentIntentResult>> createPaymentIntent() async {
    return _apiClient.post<PaymentIntentResult>(
      '/payment/create-intent',
      fromJson: (data) => PaymentIntentResult.fromJson(data),
    );
  }
}

class PaymentIntentResult {
  final String clientSecret;
  final double totalPrice;
  final double? discountAmount;
  final double? tax;
  final double? shipping;

  PaymentIntentResult({
    required this.clientSecret,
    required this.totalPrice,
    this.discountAmount,
    this.tax,
    this.shipping,
  });

  factory PaymentIntentResult.fromJson(Map<String, dynamic> json) {
    return PaymentIntentResult(
      clientSecret: json['clientSecret'] ?? '',
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble(),
      tax: (json['tax'] as num?)?.toDouble(),
      shipping: (json['shipping'] as num?)?.toDouble(),
    );
  }
}

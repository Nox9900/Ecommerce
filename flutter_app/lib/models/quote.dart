class QuoteRequest {
  final int id;
  final int? customerId;
  final String customerName;
  final String status;
  final String notes;
  final String adminNotes;
  final String responseMessage;
  final double? quotedTotal;
  final String? paymentTerms;
  final String? deliveryTime;
  final int? validityDays;
  final DateTime createdAt;
  final DateTime? respondedAt;
  final List<QuoteItem> items;

  QuoteRequest({
    required this.id,
    this.customerId,
    this.customerName = '',
    this.status = 'pending',
    this.notes = '',
    this.adminNotes = '',
    this.responseMessage = '',
    this.quotedTotal,
    this.paymentTerms,
    this.deliveryTime,
    this.validityDays,
    required this.createdAt,
    this.respondedAt,
    this.items = const [],
  });

  factory QuoteRequest.fromJson(Map<String, dynamic> json) {
    return QuoteRequest(
      id: json['id'] ?? 0,
      customerId: json['customer'],
      customerName: json['customer_name'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'] ?? '',
      adminNotes: json['admin_notes'] ?? '',
      responseMessage: json['response_message'] ?? '',
      quotedTotal: json['quoted_total'] != null
          ? double.tryParse('${json['quoted_total']}')
          : null,
      paymentTerms: json['payment_terms'],
      deliveryTime: json['delivery_time'],
      validityDays: json['validity_days'],
      createdAt:
          DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      respondedAt: json['responded_at'] != null
          ? DateTime.tryParse(json['responded_at'])
          : null,
      items: (json['items'] as List?)
              ?.map((e) => QuoteItem.fromJson(e))
              .toList() ??
          [],
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'quoted':
        return 'Quoted';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  }
}

class QuoteItem {
  final int id;
  final int productId;
  final String productName;
  final int quantity;
  final double? targetPrice;
  final double? quotedUnitPrice;
  final String notes;

  QuoteItem({
    required this.id,
    required this.productId,
    this.productName = '',
    required this.quantity,
    this.targetPrice,
    this.quotedUnitPrice,
    this.notes = '',
  });

  factory QuoteItem.fromJson(Map<String, dynamic> json) {
    return QuoteItem(
      id: json['id'] ?? 0,
      productId: json['product'] ?? 0,
      productName: json['product_name'] ?? '',
      quantity: json['quantity'] ?? 0,
      targetPrice: json['target_price'] != null
          ? double.tryParse('${json['target_price']}')
          : null,
      quotedUnitPrice: json['quoted_unit_price'] != null
          ? double.tryParse('${json['quoted_unit_price']}')
          : null,
      notes: json['notes'] ?? '',
    );
  }
}

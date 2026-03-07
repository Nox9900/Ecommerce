class AppNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final bool read;
  final NotificationData? data;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.read = false,
    this.data,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'] ?? '',
      type: json['type'] ?? 'system',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      read: json['read'] ?? false,
      data: json['data'] != null ? NotificationData.fromJson(json['data']) : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class NotificationData {
  final String? orderId;
  final String? conversationId;
  final String? productId;
  final String? trackingNumber;

  NotificationData({
    this.orderId,
    this.conversationId,
    this.productId,
    this.trackingNumber,
  });

  factory NotificationData.fromJson(Map<String, dynamic> json) {
    return NotificationData(
      orderId: json['orderId'],
      conversationId: json['conversationId'],
      productId: json['productId'],
      trackingNumber: json['trackingNumber'],
    );
  }
}

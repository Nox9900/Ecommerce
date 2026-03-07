class Review {
  final String id;
  final String productId;
  final String userId;
  final String? orderId;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  // Populated fields
  final String? userName;
  final String? userImage;

  Review({
    required this.id,
    required this.productId,
    required this.userId,
    this.orderId,
    required this.rating,
    this.comment,
    required this.createdAt,
    this.userName,
    this.userImage,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    String? userName;
    String? userImage;

    if (json['userId'] is Map) {
      userName = json['userId']['name'];
      userImage = json['userId']['imageUrl'];
    }

    return Review(
      id: json['_id'] ?? '',
      productId: json['productId'] is String
          ? json['productId']
          : (json['productId']?['_id'] ?? ''),
      userId: json['userId'] is String
          ? json['userId']
          : (json['userId']?['_id'] ?? ''),
      orderId: json['orderId'] is String
          ? json['orderId']
          : (json['orderId']?['_id'] ?? ''),
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      userName: userName,
      userImage: userImage,
    );
  }
}

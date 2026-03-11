class Review {
  final String id;
  final String productId;
  final String? userId;
  final String? userName;
  final String? userImage;
  final String? orderId;
  final int rating;
  final String comment;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.productId,
    this.userId,
    this.userName,
    this.userImage,
    this.orderId,
    required this.rating,
    this.comment = '',
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    String? userId;
    String? userName;
    String? userImage;
    if (json['userId'] is Map) {
      userId = json['userId']['_id']?.toString();
      userName = json['userId']['name'];
      userImage = json['userId']['imageUrl'];
    } else if (json['userId'] != null) {
      userId = json['userId'].toString();
    }

    return Review(
      id: json['_id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      userId: userId,
      userName: userName,
      userImage: userImage,
      orderId: json['orderId']?.toString(),
      rating: json['rating'] ?? 0,
      comment: json['comment'] ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  String get timeAgo {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inDays > 365) return '${diff.inDays ~/ 365}y ago';
    if (diff.inDays > 30) return '${diff.inDays ~/ 30}mo ago';
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    return '${diff.inMinutes}m ago';
  }
}

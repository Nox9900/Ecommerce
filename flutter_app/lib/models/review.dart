class Review {
  final int id;
  final int productId;
  final String productName;
  final String reviewerName;
  final String reviewerEmail;
  final int rating;
  final String title;
  final String comment;
  final bool isVerifiedPurchase;
  final bool isApproved;
  final int helpfulCount;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.productId,
    this.productName = '',
    required this.reviewerName,
    this.reviewerEmail = '',
    required this.rating,
    this.title = '',
    this.comment = '',
    this.isVerifiedPurchase = false,
    this.isApproved = false,
    this.helpfulCount = 0,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? 0,
      productId: json['product'] ?? 0,
      productName: json['product_name'] ?? '',
      reviewerName: json['reviewer_name'] ?? '',
      reviewerEmail: json['reviewer_email'] ?? '',
      rating: json['rating'] ?? 0,
      title: json['title'] ?? '',
      comment: json['comment'] ?? '',
      isVerifiedPurchase: json['is_verified_purchase'] ?? false,
      isApproved: json['is_approved'] ?? false,
      helpfulCount: json['helpful_count'] ?? 0,
      createdAt:
          DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
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

class AppUser {
  final String id;
  final String clerkId;
  final String email;
  final String name;
  final String imageUrl;
  final String role;
  final List<String> wishlist;
  final bool isWishlistPublic;
  final String? wishlistToken;
  final String? stripeCustomerId;
  final String? expoPushToken;

  AppUser({
    required this.id,
    required this.clerkId,
    required this.email,
    required this.name,
    this.imageUrl = '',
    this.role = 'customer',
    this.wishlist = const [],
    this.isWishlistPublic = false,
    this.wishlistToken,
    this.stripeCustomerId,
    this.expoPushToken,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['_id'] ?? '',
      clerkId: json['clerkId'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      role: json['role'] ?? 'customer',
      wishlist: json['wishlist'] != null
          ? List<String>.from(json['wishlist'].map((w) => w is String ? w : w['_id'] ?? ''))
          : [],
      isWishlistPublic: json['isWishlistPublic'] ?? false,
      wishlistToken: json['wishlistToken'],
      stripeCustomerId: json['stripeCustomerId'],
      expoPushToken: json['expoPushToken'],
    );
  }

  bool get isVendor => role == 'vendor' || role == 'admin';
  bool get isAdmin => role == 'admin';
}

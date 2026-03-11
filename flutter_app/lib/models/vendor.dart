class Vendor {
  final int id;
  final String storeName;
  final String slug;
  final String description;
  final String? logo;
  final String? banner;
  final String? phone;
  final String country;
  final String city;
  final String verificationLevel;
  final Map<String, dynamic>? verificationBadge;
  final bool isTradeAssurance;
  final double rating;
  final int totalReviews;
  final double responseRate;
  final String responseTimeDisplay;
  final double onTimeDeliveryRate;
  final int totalTransactions;
  final int followerCount;
  final bool isApproved;
  final bool isActive;

  Vendor({
    required this.id,
    required this.storeName,
    this.slug = '',
    this.description = '',
    this.logo,
    this.banner,
    this.phone,
    this.country = '',
    this.city = '',
    this.verificationLevel = 'basic',
    this.verificationBadge,
    this.isTradeAssurance = false,
    this.rating = 0,
    this.totalReviews = 0,
    this.responseRate = 0,
    this.responseTimeDisplay = '',
    this.onTimeDeliveryRate = 0,
    this.totalTransactions = 0,
    this.followerCount = 0,
    this.isApproved = false,
    this.isActive = false,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) {
    return Vendor(
      id: json['id'] ?? 0,
      storeName: json['store_name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      logo: json['logo'],
      banner: json['banner'],
      phone: json['phone'],
      country: json['country'] ?? '',
      city: json['city'] ?? '',
      verificationLevel: json['verification_level'] ?? 'basic',
      verificationBadge: json['verification_badge'] is Map
          ? Map<String, dynamic>.from(json['verification_badge'])
          : null,
      isTradeAssurance: json['is_trade_assurance'] ?? false,
      rating: double.tryParse('${json['rating']}') ?? 0,
      totalReviews: json['total_reviews'] ?? 0,
      responseRate: double.tryParse('${json['response_rate']}') ?? 0,
      responseTimeDisplay: json['response_time_display'] ?? '',
      onTimeDeliveryRate:
          double.tryParse('${json['on_time_delivery_rate']}') ?? 0,
      totalTransactions: json['total_transactions'] ?? 0,
      followerCount: json['follower_count'] ?? 0,
      isApproved: json['is_approved'] ?? false,
      isActive: json['is_active'] ?? false,
    );
  }

  String get badgeLabel =>
      verificationBadge?['label'] ?? verificationLevel.toUpperCase();

  String get location {
    if (city.isNotEmpty && country.isNotEmpty) return '$city, $country';
    return country.isNotEmpty ? country : city;
  }
}

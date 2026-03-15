class Shop {
  final String id;
  final String name;
  final String description;
  final String logoUrl;
  final String bannerUrl;
  final String vendorId;
  final String ownerId;

  Shop({
    required this.id,
    required this.name,
    required this.description,
    required this.logoUrl,
    required this.bannerUrl,
    required this.vendorId,
    required this.ownerId,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      logoUrl: json['logoUrl'] ?? '',
      bannerUrl: json['bannerUrl'] ?? '',
      vendorId: json['vendor'] ?? '',
      ownerId: json['owner'] ?? '',
    );
  }
}

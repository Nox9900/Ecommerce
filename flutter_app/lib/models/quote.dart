/// Shop model matching the backend's Shop schema.
class Shop {
  final String id;
  final String name;
  final String description;
  final String? logoUrl;
  final String? bannerUrl;
  final String? vendorId;
  final String? vendorName;
  final String? vendorLogo;
  final String? ownerId;
  final DateTime createdAt;
  final DateTime updatedAt;

  Shop({
    required this.id,
    required this.name,
    this.description = '',
    this.logoUrl,
    this.bannerUrl,
    this.vendorId,
    this.vendorName,
    this.vendorLogo,
    this.ownerId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    String? vendorId;
    String? vendorName;
    String? vendorLogo;
    if (json['vendor'] is Map) {
      vendorId = json['vendor']['_id']?.toString();
      vendorName = json['vendor']['shopName'];
      vendorLogo = json['vendor']['logoUrl'];
    } else if (json['vendor'] != null) {
      vendorId = json['vendor'].toString();
    }

    return Shop(
      id: json['_id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      logoUrl: json['logoUrl'],
      bannerUrl: json['bannerUrl'],
      vendorId: vendorId,
      vendorName: vendorName,
      vendorLogo: vendorLogo,
      ownerId: json['owner']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }
}

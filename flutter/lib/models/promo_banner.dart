class PromoBanner {
  final String id;
  final String title;
  final String label;
  final String imageUrl;
  final String price;
  final String type; // "subsidy" | "fresh"
  final bool isActive;
  final int displayOrder;

  PromoBanner({
    required this.id,
    required this.title,
    required this.label,
    required this.imageUrl,
    required this.price,
    required this.type,
    required this.isActive,
    required this.displayOrder,
  });

  factory PromoBanner.fromJson(Map<String, dynamic> json) {
    return PromoBanner(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      label: json['label'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      price: json['price'] ?? '',
      type: json['type'] ?? 'fresh',
      isActive: json['isActive'] ?? true,
      displayOrder: json['displayOrder'] ?? 0,
    );
  }
}

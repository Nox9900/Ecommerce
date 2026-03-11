class PromoBanner {
  final String id;
  final String title;
  final String? label;
  final String? imageUrl;
  final double? price;
  final String type;
  final bool isActive;
  final int displayOrder;

  PromoBanner({
    required this.id,
    required this.title,
    this.label,
    this.imageUrl,
    this.price,
    this.type = 'subsidy',
    this.isActive = true,
    this.displayOrder = 0,
  });

  factory PromoBanner.fromJson(Map<String, dynamic> json) {
    return PromoBanner(
      id: json['_id']?.toString() ?? '',
      title: json['title'] ?? '',
      label: json['label'],
      imageUrl: json['imageUrl'],
      price: json['price'] != null
          ? double.tryParse('${json['price']}')
          : null,
      type: json['type'] ?? 'subsidy',
      isActive: json['isActive'] ?? true,
      displayOrder: json['displayOrder'] ?? 0,
    );
  }
}

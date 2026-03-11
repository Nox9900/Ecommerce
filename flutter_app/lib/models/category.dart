class Subcategory {
  final String id;
  final String name;
  final String? icon;
  final String? color;

  Subcategory({
    required this.id,
    this.name = '',
    this.icon,
    this.color,
  });

  factory Subcategory.fromJson(Map<String, dynamic> json) {
    return Subcategory(
      id: json['_id']?.toString() ?? '',
      name: json['name'] ?? '',
      icon: json['icon'],
      color: json['color'],
    );
  }
}

class Category {
  final String id;
  final String name;
  final String? icon;
  final String? color;
  final int displayOrder;
  final bool isActive;
  final List<Subcategory> subcategories;

  Category({
    required this.id,
    required this.name,
    this.icon,
    this.color,
    this.displayOrder = 0,
    this.isActive = true,
    this.subcategories = const [],
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id']?.toString() ?? '',
      name: json['name'] ?? '',
      icon: json['icon'],
      color: json['color'],
      displayOrder: json['displayOrder'] ?? 0,
      isActive: json['isActive'] ?? true,
      subcategories: (json['subcategories'] as List?)
              ?.map((e) => Subcategory.fromJson(e))
              .toList() ??
          [],
    );
  }

  bool get isParent => true;
}

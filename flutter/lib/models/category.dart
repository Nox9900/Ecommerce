class Category {
  final String id;
  final String name;
  final String? icon;
  final List<Subcategory> subcategories;

  Category({
    required this.id,
    required this.name,
    this.icon,
    required this.subcategories,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'],
      subcategories: (json['subcategories'] as List? ?? [])
          .map((s) => Subcategory.fromJson(s))
          .toList(),
    );
  }
}

class Subcategory {
  final String id;
  final String name;

  Subcategory({required this.id, required this.name});

  factory Subcategory.fromJson(Map<String, dynamic> json) {
    return Subcategory(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
    );
  }
}

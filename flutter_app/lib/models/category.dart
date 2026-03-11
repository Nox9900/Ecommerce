class Category {
  final int id;
  final String name;
  final String description;
  final int productCount;
  final int? parentId;
  final String? parentName;

  Category({
    required this.id,
    required this.name,
    this.description = '',
    this.productCount = 0,
    this.parentId,
    this.parentName,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      productCount: json['product_count'] ?? 0,
      parentId: json['parent'],
      parentName: json['parent_name'],
    );
  }

  bool get isParent => parentId == null;
}

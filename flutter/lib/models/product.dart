class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String? image;
  final List<String> images;
  final String category;
  final String subcategory;
  final double averageRating;
  final int totalReviews;
  final int countInStock;
  final dynamic shop; // Can be String or Map
  final int? soldCount;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.image,
    required this.images,
    required this.category,
    required this.subcategory,
    this.averageRating = 0,
    this.totalReviews = 0,
    this.countInStock = 0,
    this.shop,
    this.soldCount,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      image: json['image'],
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      category: json['category'] ?? '',
      subcategory: json['subcategory'] ?? '',
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['totalReviews'] ?? 0,
      countInStock: json['countInStock'] ?? 0,
      shop: json['shop'],
      soldCount: json['soldCount'],
    );
  }
}

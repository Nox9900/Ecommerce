class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? originalPrice;
  final int stock;
  final String? image;
  final List<String> images;
  final String category;
  final String subcategory;
  final double averageRating;
  final int totalReviews;
  final int countInStock;
  final dynamic shop;
  final int? soldCount;
  final List<ProductVariant> variants;
  final String? vendorId;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.originalPrice,
    this.stock = 0,
    this.image,
    required this.images,
    required this.category,
    required this.subcategory,
    this.averageRating = 0,
    this.totalReviews = 0,
    this.countInStock = 0,
    this.shop,
    this.soldCount,
    this.variants = const [],
    this.vendorId,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      originalPrice: (json['originalPrice'] as num?)?.toDouble(),
      stock: json['stock'] ?? json['countInStock'] ?? 0,
      image: json['image'] ?? (json['images'] is List && (json['images'] as List).isNotEmpty ? json['images'][0] : null),
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      category: json['category'] ?? '',
      subcategory: json['subcategory'] ?? '',
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['totalReviews'] ?? 0,
      countInStock: json['countInStock'] ?? json['stock'] ?? 0,
      shop: json['shop'],
      soldCount: json['soldCount'],
      variants: (json['variants'] as List? ?? [])
          .map((v) => ProductVariant.fromJson(v))
          .toList(),
      vendorId: json['vendor'] is String ? json['vendor'] : json['vendor']?['_id'],
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'description': description,
    'price': price,
    'originalPrice': originalPrice,
    'images': images,
    'category': category,
    'subcategory': subcategory,
  };

  /// Get shop name whether shop is String or Map
  String get shopName {
    if (shop is Map) return shop['name'] ?? '';
    return '';
  }
}

class ProductVariant {
  final String? id;
  final String name;
  final double price;
  final int stock;
  final String? image;

  ProductVariant({
    this.id,
    required this.name,
    required this.price,
    this.stock = 0,
    this.image,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['_id'],
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      stock: json['stock'] ?? 0,
      image: json['image'],
    );
  }
}

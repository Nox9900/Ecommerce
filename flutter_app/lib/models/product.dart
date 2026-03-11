class ProductVariant {
  final String id;
  final String name;
  final Map<String, dynamic> options;
  final double? price;
  final int stock;
  final String? sku;
  final String? image;

  ProductVariant({
    required this.id,
    this.name = '',
    this.options = const {},
    this.price,
    this.stock = 0,
    this.sku,
    this.image,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['_id']?.toString() ?? '',
      name: json['name'] ?? '',
      options: json['options'] is Map
          ? Map<String, dynamic>.from(json['options'])
          : {},
      price: json['price'] != null
          ? double.tryParse('${json['price']}')
          : null,
      stock: json['stock'] ?? 0,
      sku: json['sku'],
      image: json['image'],
    );
  }
}

class ProductAttribute {
  final String name;
  final List<String> values;

  ProductAttribute({required this.name, this.values = const []});

  factory ProductAttribute.fromJson(Map<String, dynamic> json) {
    return ProductAttribute(
      name: json['name'] ?? '',
      values: (json['values'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? originalPrice;
  final String? brand;
  final bool isSubsidy;
  final int soldCount;
  final int stock;
  final String? category;
  final String? subcategory;
  final List<ProductAttribute> attributes;
  final List<String> images;
  final double averageRating;
  final int totalReviews;
  final String? vendorId;
  final String? vendorName;
  final String? shopId;
  final String? shopName;
  final String? shopLogo;
  final List<ProductVariant> variants;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    this.description = '',
    required this.price,
    this.originalPrice,
    this.brand,
    this.isSubsidy = false,
    this.soldCount = 0,
    required this.stock,
    this.category,
    this.subcategory,
    this.attributes = const [],
    this.images = const [],
    this.averageRating = 0,
    this.totalReviews = 0,
    this.vendorId,
    this.vendorName,
    this.shopId,
    this.shopName,
    this.shopLogo,
    this.variants = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // vendor can be an object or a string ID
    String? vendorId;
    String? vendorName;
    if (json['vendor'] is Map) {
      vendorId = json['vendor']['_id']?.toString();
      vendorName = json['vendor']['shopName'] ?? '';
    } else if (json['vendor'] != null) {
      vendorId = json['vendor'].toString();
    }

    // shop can be an object or a string ID
    String? shopId;
    String? shopName;
    String? shopLogo;
    if (json['shop'] is Map) {
      shopId = json['shop']['_id']?.toString();
      shopName = json['shop']['name'] ?? '';
      shopLogo = json['shop']['logoUrl'];
    } else if (json['shop'] != null) {
      shopId = json['shop'].toString();
    }

    return Product(
      id: json['_id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: double.tryParse('${json['price']}') ?? 0,
      originalPrice: json['originalPrice'] != null
          ? double.tryParse('${json['originalPrice']}')
          : null,
      brand: json['brand'],
      isSubsidy: json['isSubsidy'] ?? false,
      soldCount: json['soldCount'] ?? 0,
      stock: json['stock'] ?? 0,
      category: json['category'],
      subcategory: json['subcategory'],
      attributes: (json['attributes'] as List?)
              ?.map((e) => ProductAttribute.fromJson(e))
              .toList() ??
          [],
      images: (json['images'] as List?)?.map((e) => e.toString()).toList() ?? [],
      averageRating: double.tryParse('${json['averageRating']}') ?? 0,
      totalReviews: json['totalReviews'] ?? 0,
      vendorId: vendorId,
      vendorName: vendorName,
      shopId: shopId,
      shopName: shopName,
      shopLogo: shopLogo,
      variants: (json['variants'] as List?)
              ?.map((e) => ProductVariant.fromJson(e))
              .toList() ??
          [],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  bool get isInStock => stock > 0;
  bool get hasDiscount => originalPrice != null && originalPrice! > price;

  double get discountPercent {
    if (!hasDiscount) return 0;
    return ((originalPrice! - price) / originalPrice! * 100).roundToDouble();
  }

  String? get primaryImage => images.isNotEmpty ? images.first : null;
}

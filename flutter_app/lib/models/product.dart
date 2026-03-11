class TieredPrice {
  final int id;
  final int minQuantity;
  final double price;

  TieredPrice({required this.id, required this.minQuantity, required this.price});

  factory TieredPrice.fromJson(Map<String, dynamic> json) {
    return TieredPrice(
      id: json['id'] ?? 0,
      minQuantity: json['min_quantity'] ?? 0,
      price: double.tryParse('${json['price']}') ?? 0,
    );
  }
}

class Product {
  final int id;
  final String name;
  final String sku;
  final String description;
  final int categoryId;
  final String categoryName;
  final int? vendorId;
  final String vendorName;
  final double purchasePrice;
  final double sellingPrice;
  final int moq;
  final int stockQuantity;
  final int lowStockThreshold;
  final String stockStatus;
  final String? imageUrl;
  final String? image2;
  final String? image3;
  final String? image4;
  final bool isActive;
  final bool sampleAvailable;
  final double? samplePrice;
  final String? samplePriceDisplay;
  final Map<String, dynamic>? customSpecifications;
  final List<TieredPrice> tieredPrices;
  final double? profitMargin;
  final double? profitAmount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.sku,
    this.description = '',
    required this.categoryId,
    required this.categoryName,
    this.vendorId,
    this.vendorName = '',
    this.purchasePrice = 0,
    required this.sellingPrice,
    this.moq = 1,
    required this.stockQuantity,
    this.lowStockThreshold = 0,
    this.stockStatus = 'In Stock',
    this.imageUrl,
    this.image2,
    this.image3,
    this.image4,
    required this.isActive,
    this.sampleAvailable = false,
    this.samplePrice,
    this.samplePriceDisplay,
    this.customSpecifications,
    this.tieredPrices = const [],
    this.profitMargin,
    this.profitAmount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      sku: json['sku'] ?? '',
      description: json['description'] ?? '',
      categoryId: json['category'] ?? 0,
      categoryName: json['category_name'] ?? '',
      vendorId: json['vendor'],
      vendorName: json['vendor_name'] ?? '',
      purchasePrice: double.tryParse('${json['purchase_price']}') ?? 0,
      sellingPrice: double.tryParse('${json['selling_price']}') ?? 0,
      moq: json['moq'] ?? 1,
      stockQuantity: json['stock_quantity'] ?? 0,
      lowStockThreshold: json['low_stock_threshold'] ?? 0,
      stockStatus: json['stock_status'] ?? 'In Stock',
      imageUrl: json['image'],
      image2: json['image_2'],
      image3: json['image_3'],
      image4: json['image_4'],
      isActive: json['is_active'] ?? true,
      sampleAvailable: json['sample_available'] ?? false,
      samplePrice: json['sample_price'] != null
          ? double.tryParse('${json['sample_price']}')
          : null,
      samplePriceDisplay: json['sample_price_display'],
      customSpecifications: json['custom_specifications'] is Map
          ? Map<String, dynamic>.from(json['custom_specifications'])
          : null,
      tieredPrices: (json['tiered_prices'] as List?)
              ?.map((e) => TieredPrice.fromJson(e))
              .toList() ??
          [],
      profitMargin: json['profit_margin'] != null
          ? double.tryParse('${json['profit_margin']}')
          : null,
      profitAmount: json['profit_amount'] != null
          ? double.tryParse('${json['profit_amount']}')
          : null,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
    );
  }

  bool get isInStock => stockQuantity > 0;
  bool get isLowStock => stockQuantity <= lowStockThreshold && stockQuantity > 0;

  List<String> get allImages {
    return [imageUrl, image2, image3, image4]
        .where((i) => i != null && i.isNotEmpty)
        .cast<String>()
        .toList();
  }
}

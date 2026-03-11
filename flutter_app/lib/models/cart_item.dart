import 'product.dart';

/// Represents a single item in the server-side cart.
class CartItem {
  final String id;
  final Product product;
  int quantity;
  final String? variantId;
  final Map<String, dynamic>? selectedOptions;

  CartItem({
    this.id = '',
    required this.product,
    this.quantity = 1,
    this.variantId,
    this.selectedOptions,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['_id']?.toString() ?? '',
      product: Product.fromJson(json['product'] is Map ? json['product'] : {}),
      quantity: json['quantity'] ?? 1,
      variantId: json['variantId']?.toString(),
      selectedOptions: json['selectedOptions'] is Map
          ? Map<String, dynamic>.from(json['selectedOptions'])
          : null,
    );
  }

  double get totalPrice => product.price * quantity;
}

/// Server-side cart model with coupon support.
class Cart {
  final String id;
  final List<CartItem> items;
  final String? couponCode;
  final double subtotal;
  final double discountAmount;
  final double totalPrice;
  final Map<String, dynamic>? couponDetails;

  Cart({
    this.id = '',
    this.items = const [],
    this.couponCode,
    this.subtotal = 0,
    this.discountAmount = 0,
    this.totalPrice = 0,
    this.couponDetails,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['_id']?.toString() ?? '',
      items: (json['items'] as List?)
              ?.map((e) => CartItem.fromJson(e))
              .toList() ??
          [],
      couponCode: json['coupon'],
      subtotal: double.tryParse('${json['subtotal']}') ?? 0,
      discountAmount: double.tryParse('${json['discountAmount']}') ?? 0,
      totalPrice: double.tryParse('${json['totalPrice']}') ?? 0,
      couponDetails: json['couponDetails'] is Map
          ? Map<String, dynamic>.from(json['couponDetails'])
          : null,
    );
  }

  bool get isEmpty => items.isEmpty;
  int get itemCount => items.length;
  int get totalQuantity =>
      items.fold(0, (sum, item) => sum + item.quantity);
}

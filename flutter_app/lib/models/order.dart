class OrderItem {
  final int id;
  final int productId;
  final String productName;
  final String productSku;
  final String? productImage;
  final int quantity;
  final double priceAtPurchase;
  final double totalPrice;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    this.productSku = '',
    this.productImage,
    required this.quantity,
    required this.priceAtPurchase,
    required this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? 0,
      productId: json['product'] ?? 0,
      productName: json['product_name'] ?? '',
      productSku: json['product_sku'] ?? '',
      productImage: json['product_image'],
      quantity: json['quantity'] ?? 0,
      priceAtPurchase: double.tryParse('${json['price_at_purchase']}') ?? 0,
      totalPrice: double.tryParse('${json['total_price']}') ?? 0,
    );
  }
}

class Order {
  final int id;
  final String orderNumber;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String customerAddress;
  final String customerCity;
  final String customerCountry;
  final String status;
  final String paymentMethod;
  final double subtotal;
  final double shippingCost;
  final double totalAmount;
  final String notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.orderNumber,
    this.customerName = '',
    this.customerEmail = '',
    this.customerPhone = '',
    this.customerAddress = '',
    this.customerCity = '',
    this.customerCountry = '',
    required this.status,
    this.paymentMethod = '',
    this.subtotal = 0,
    this.shippingCost = 0,
    required this.totalAmount,
    this.notes = '',
    required this.createdAt,
    required this.updatedAt,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      customerName: json['customer_name'] ?? '',
      customerEmail: json['customer_email'] ?? '',
      customerPhone: json['customer_phone'] ?? '',
      customerAddress: json['customer_address'] ?? '',
      customerCity: json['customer_city'] ?? '',
      customerCountry: json['customer_country'] ?? '',
      status: json['status'] ?? '',
      paymentMethod: json['payment_method'] ?? '',
      subtotal: double.tryParse('${json['subtotal']}') ?? 0,
      shippingCost: double.tryParse('${json['shipping_cost']}') ?? 0,
      totalAmount: double.tryParse('${json['total_amount']}') ?? 0,
      notes: json['notes'] ?? '',
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
      items: (json['items'] as List?)
              ?.map((e) => OrderItem.fromJson(e))
              .toList() ??
          [],
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
}

class Order {
  final String id;
  final String clerkId;
  final List<OrderItem> orderItems;
  final ShippingAddress shippingAddress;
  final PaymentResult? paymentResult;
  final double totalPrice;
  final String? couponCode;
  final double discountAmount;
  final double? subtotalBeforeDiscount;
  final String status;
  final String trackingNumber;
  final String carrier;
  final DateTime? estimatedDelivery;
  final DateTime? deliveredAt;
  final DateTime? shippedAt;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.clerkId,
    required this.orderItems,
    required this.shippingAddress,
    this.paymentResult,
    required this.totalPrice,
    this.couponCode,
    this.discountAmount = 0,
    this.subtotalBeforeDiscount,
    this.status = 'pending',
    this.trackingNumber = '',
    this.carrier = '',
    this.estimatedDelivery,
    this.deliveredAt,
    this.shippedAt,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? '',
      clerkId: json['clerkId'] ?? '',
      orderItems: (json['orderItems'] as List? ?? [])
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      shippingAddress: ShippingAddress.fromJson(json['shippingAddress'] ?? {}),
      paymentResult: json['paymentResult'] != null
          ? PaymentResult.fromJson(json['paymentResult'])
          : null,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
      couponCode: json['couponCode'],
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      subtotalBeforeDiscount: (json['subtotalBeforeDiscount'] as num?)?.toDouble(),
      status: json['status'] ?? 'pending',
      trackingNumber: json['trackingNumber'] ?? '',
      carrier: json['carrier'] ?? '',
      estimatedDelivery: json['estimatedDelivery'] != null
          ? DateTime.tryParse(json['estimatedDelivery'])
          : null,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.tryParse(json['deliveredAt'])
          : null,
      shippedAt: json['shippedAt'] != null
          ? DateTime.tryParse(json['shippedAt'])
          : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class OrderItem {
  final String productId;
  final String? variantId;
  final String name;
  final double price;
  final int quantity;
  final String image;
  final Map<String, String>? selectedOptions;

  OrderItem({
    required this.productId,
    this.variantId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.image,
    this.selectedOptions,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['product'] is String ? json['product'] : (json['product']?['_id'] ?? ''),
      variantId: json['variantId'],
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] ?? 1,
      image: json['image'] ?? '',
      selectedOptions: json['selectedOptions'] != null
          ? Map<String, String>.from(json['selectedOptions'])
          : null,
    );
  }
}

class ShippingAddress {
  final String fullName;
  final String streetAddress;
  final String city;
  final String state;
  final String zipCode;
  final String phoneNumber;

  ShippingAddress({
    required this.fullName,
    required this.streetAddress,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.phoneNumber,
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      fullName: json['fullName'] ?? '',
      streetAddress: json['streetAddress'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      zipCode: json['zipCode'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'streetAddress': streetAddress,
    'city': city,
    'state': state,
    'zipCode': zipCode,
    'phoneNumber': phoneNumber,
  };
}

class PaymentResult {
  final String? id;
  final String? status;

  PaymentResult({this.id, this.status});

  factory PaymentResult.fromJson(Map<String, dynamic> json) {
    return PaymentResult(
      id: json['id'],
      status: json['status'],
    );
  }
}

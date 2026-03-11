class OrderItem {
  final String? productId;
  final String? variantId;
  final String name;
  final double price;
  final int quantity;
  final String? image;
  final Map<String, dynamic>? selectedOptions;

  OrderItem({
    this.productId,
    this.variantId,
    this.name = '',
    this.price = 0,
    this.quantity = 0,
    this.image,
    this.selectedOptions,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['product']?.toString(),
      variantId: json['variantId']?.toString(),
      name: json['name'] ?? '',
      price: double.tryParse('${json['price']}') ?? 0,
      quantity: json['quantity'] ?? 0,
      image: json['image'],
      selectedOptions: json['selectedOptions'] is Map
          ? Map<String, dynamic>.from(json['selectedOptions'])
          : null,
    );
  }

  double get totalPrice => price * quantity;
}

class ShippingAddress {
  final String fullName;
  final String streetAddress;
  final String city;
  final String state;
  final String zipCode;
  final String phoneNumber;

  ShippingAddress({
    this.fullName = '',
    this.streetAddress = '',
    this.city = '',
    this.state = '',
    this.zipCode = '',
    this.phoneNumber = '',
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

class Order {
  final String id;
  final String? userId;
  final List<OrderItem> orderItems;
  final ShippingAddress? shippingAddress;
  final Map<String, dynamic>? paymentResult;
  final double totalPrice;
  final String? couponCode;
  final double discountAmount;
  final double subtotalBeforeDiscount;
  final String status;
  final String? trackingNumber;
  final String? carrier;
  final DateTime? estimatedDelivery;
  final DateTime? deliveredAt;
  final DateTime? shippedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Order({
    required this.id,
    this.userId,
    this.orderItems = const [],
    this.shippingAddress,
    this.paymentResult,
    this.totalPrice = 0,
    this.couponCode,
    this.discountAmount = 0,
    this.subtotalBeforeDiscount = 0,
    required this.status,
    this.trackingNumber,
    this.carrier,
    this.estimatedDelivery,
    this.deliveredAt,
    this.shippedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id']?.toString() ?? '',
      userId: json['user']?.toString(),
      orderItems: (json['orderItems'] as List?)
              ?.map((e) => OrderItem.fromJson(e))
              .toList() ??
          [],
      shippingAddress: json['shippingAddress'] != null
          ? ShippingAddress.fromJson(json['shippingAddress'])
          : null,
      paymentResult: json['paymentResult'] is Map
          ? Map<String, dynamic>.from(json['paymentResult'])
          : null,
      totalPrice: double.tryParse('${json['totalPrice']}') ?? 0,
      couponCode: json['couponCode'],
      discountAmount: double.tryParse('${json['discountAmount']}') ?? 0,
      subtotalBeforeDiscount:
          double.tryParse('${json['subtotalBeforeDiscount']}') ?? 0,
      status: json['status'] ?? 'pending',
      trackingNumber: json['trackingNumber'],
      carrier: json['carrier'],
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
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  }

  int get totalItemCount =>
      orderItems.fold(0, (sum, item) => sum + item.quantity);
}

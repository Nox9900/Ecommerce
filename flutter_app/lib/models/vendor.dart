class Vendor {
  final String id;
  final String? ownerId;
  final String shopName;
  final String description;
  final String status;
  final double commissionRate;
  final double earnings;
  final String? logoUrl;
  final String? bannerUrl;
  final String? stripeConnectId;
  final bool payoutsEnabled;
  final DateTime createdAt;
  final DateTime updatedAt;

  Vendor({
    required this.id,
    this.ownerId,
    required this.shopName,
    this.description = '',
    this.status = 'pending',
    this.commissionRate = 10,
    this.earnings = 0,
    this.logoUrl,
    this.bannerUrl,
    this.stripeConnectId,
    this.payoutsEnabled = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) {
    return Vendor(
      id: json['_id']?.toString() ?? '',
      ownerId: json['owner'] is Map
          ? json['owner']['_id']?.toString()
          : json['owner']?.toString(),
      shopName: json['shopName'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      commissionRate:
          double.tryParse('${json['commissionRate']}') ?? 10,
      earnings: double.tryParse('${json['earnings']}') ?? 0,
      logoUrl: json['logoUrl'],
      bannerUrl: json['bannerUrl'],
      stripeConnectId: json['stripeConnectId'],
      payoutsEnabled: json['payoutsEnabled'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';
  bool get isRejected => status == 'rejected';
}

class Address {
  final String id;
  final String label;
  final String fullName;
  final String streetAddress;
  final String city;
  final String state;
  final String zipCode;
  final String phoneNumber;
  final bool isDefault;

  Address({
    required this.id,
    this.label = '',
    this.fullName = '',
    this.streetAddress = '',
    this.city = '',
    this.state = '',
    this.zipCode = '',
    this.phoneNumber = '',
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['_id']?.toString() ?? '',
      label: json['label'] ?? '',
      fullName: json['fullName'] ?? '',
      streetAddress: json['streetAddress'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      zipCode: json['zipCode'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        'fullName': fullName,
        'streetAddress': streetAddress,
        'city': city,
        'state': state,
        'zipCode': zipCode,
        'phoneNumber': phoneNumber,
        'isDefault': isDefault,
      };
}

class User {
  final String id;
  final String email;
  final String name;
  final String? imageUrl;
  final String clerkId;
  final String role;
  final List<Address> addresses;
  final List<String> wishlist;
  final bool isWishlistPublic;
  final String? wishlistToken;
  final String? stripeCustomerId;
  final String? expoPushToken;

  User({
    required this.id,
    required this.email,
    this.name = '',
    this.imageUrl,
    this.clerkId = '',
    this.role = 'customer',
    this.addresses = const [],
    this.wishlist = const [],
    this.isWishlistPublic = false,
    this.wishlistToken,
    this.stripeCustomerId,
    this.expoPushToken,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id']?.toString() ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      imageUrl: json['imageUrl'],
      clerkId: json['clerkId'] ?? '',
      role: json['role'] ?? 'customer',
      addresses: (json['addresses'] as List?)
              ?.map((e) => Address.fromJson(e))
              .toList() ??
          [],
      wishlist: (json['wishlist'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      isWishlistPublic: json['isWishlistPublic'] ?? false,
      wishlistToken: json['wishlistToken'],
      stripeCustomerId: json['stripeCustomerId'],
      expoPushToken: json['expoPushToken'],
    );
  }

  String get displayName => name.isNotEmpty ? name : email.split('@').first;

  String get initials {
    if (name.isNotEmpty) {
      final parts = name.split(' ');
      if (parts.length >= 2) {
        return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return email.isNotEmpty ? email[0].toUpperCase() : '?';
  }

  bool get isAdmin => role == 'admin';
  bool get isVendor => role == 'vendor';
}

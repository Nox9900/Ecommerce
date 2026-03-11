class UserProfile {
  final String companyName;
  final String businessType;
  final String taxId;
  final String phone;
  final String alternatePhone;
  final String addressLine1;
  final String addressLine2;
  final String city;
  final String state;
  final String postalCode;
  final String country;

  UserProfile({
    this.companyName = '',
    this.businessType = '',
    this.taxId = '',
    this.phone = '',
    this.alternatePhone = '',
    this.addressLine1 = '',
    this.addressLine2 = '',
    this.city = '',
    this.state = '',
    this.postalCode = '',
    this.country = '',
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      companyName: json['company_name'] ?? '',
      businessType: json['business_type'] ?? '',
      taxId: json['tax_id'] ?? '',
      phone: json['phone'] ?? '',
      alternatePhone: json['alternate_phone'] ?? '',
      addressLine1: json['address_line1'] ?? '',
      addressLine2: json['address_line2'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      postalCode: json['postal_code'] ?? '',
      country: json['country'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'company_name': companyName,
        'business_type': businessType,
        'tax_id': taxId,
        'phone': phone,
        'alternate_phone': alternatePhone,
        'address_line1': addressLine1,
        'address_line2': addressLine2,
        'city': city,
        'state': state,
        'postal_code': postalCode,
        'country': country,
      };
}

class User {
  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final UserProfile? profile;

  User({
    required this.id,
    required this.username,
    this.email = '',
    this.firstName = '',
    this.lastName = '',
    this.profile,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      profile: json['profile'] != null
          ? UserProfile.fromJson(json['profile'])
          : null,
    );
  }

  String get displayName {
    if (firstName.isNotEmpty || lastName.isNotEmpty) {
      return '$firstName $lastName'.trim();
    }
    return username;
  }

  String get initials {
    if (firstName.isNotEmpty) return firstName[0].toUpperCase();
    if (username.isNotEmpty) return username[0].toUpperCase();
    return '?';
  }
}

class Address {
  final String? id;
  final String label;
  final String fullName;
  final String streetAddress;
  final String city;
  final String state;
  final String zipCode;
  final String phoneNumber;
  final bool isDefault;

  Address({
    this.id,
    required this.label,
    required this.fullName,
    required this.streetAddress,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.phoneNumber,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['_id'],
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

  Map<String, dynamic> toJson() {
    return {
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
}

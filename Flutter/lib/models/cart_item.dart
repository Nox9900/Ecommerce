import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? variantId;
  final Map<String, String>? selectedOptions;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.variantId,
    this.selectedOptions,
  });

  double get totalPrice => product.price * quantity;

  Map<String, dynamic> toJson() {
    return {
      'product': product.id,
      'quantity': quantity,
      'variantId': variantId,
      'selectedOptions': selectedOptions,
    };
  }
}

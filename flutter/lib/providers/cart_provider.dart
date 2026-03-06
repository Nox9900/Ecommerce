import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../models/product.dart';

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  double get totalAmount => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  void addItem(Product product, {int quantity = 1, String? variantId, Map<String, String>? options}) {
    final existingIndex = _items.indexWhere((item) => 
      item.product.id == product.id && item.variantId == variantId
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(
        product: product,
        quantity: quantity,
        variantId: variantId,
        selectedOptions: options,
      ));
    }
    notifyListeners();
  }

  void removeItem(String productId, {String? variantId}) {
    _items.removeWhere((item) => 
      item.product.id == productId && item.variantId == variantId
    );
    notifyListeners();
  }

  void updateQuantity(String productId, int quantity, {String? variantId}) {
    final index = _items.indexWhere((item) => 
      item.product.id == productId && item.variantId == variantId
    );
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      notifyListeners();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}

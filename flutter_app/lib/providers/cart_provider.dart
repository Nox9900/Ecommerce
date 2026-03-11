import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import '../models/product.dart';

class CartProvider extends ChangeNotifier {
  final Map<int, CartItem> _items = {};
  static const _storageKey = 'cart_items';

  Map<int, CartItem> get items => {..._items};
  List<CartItem> get itemList => _items.values.toList();
  int get itemCount => _items.length;
  bool get isEmpty => _items.isEmpty;

  /// Effective price for a cart item, applying tiered pricing if available.
  double effectivePrice(CartItem item) {
    final p = item.product;
    if (p.tieredPrices.isEmpty) return p.sellingPrice;
    // tieredPrices are sorted by minQuantity (ascending from API)
    double price = p.sellingPrice;
    for (final tier in p.tieredPrices) {
      if (item.quantity >= tier.minQuantity) {
        price = tier.price;
      }
    }
    return price;
  }

  double get subtotal => _items.values.fold(
      0, (sum, item) => sum + effectivePrice(item) * item.quantity);

  double get shippingCost => subtotal >= 500 ? 0 : (subtotal > 0 ? 25.00 : 0);

  double get total => subtotal + shippingCost;

  int get totalQuantity =>
      _items.values.fold(0, (sum, item) => sum + item.quantity);

  bool isInCart(int productId) => _items.containsKey(productId);

  /// Restore cart from SharedPreferences
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null) {
      try {
        final List list = jsonDecode(raw);
        for (final entry in list) {
          final product = Product.fromJson(entry['product']);
          _items[product.id] =
              CartItem(product: product, quantity: entry['quantity'] ?? 1);
        }
      } catch (_) {
        // Corrupted data — start fresh
      }
    }
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    final data = _items.values
        .map((item) => {
              'product': _productToJson(item.product),
              'quantity': item.quantity,
            })
        .toList();
    await prefs.setString(_storageKey, jsonEncode(data));
  }

  Map<String, dynamic> _productToJson(Product p) => {
        'id': p.id,
        'name': p.name,
        'sku': p.sku,
        'description': p.description,
        'category': p.categoryId,
        'category_name': p.categoryName,
        'vendor': p.vendorId,
        'vendor_name': p.vendorName,
        'purchase_price': p.purchasePrice,
        'selling_price': p.sellingPrice,
        'moq': p.moq,
        'stock_quantity': p.stockQuantity,
        'low_stock_threshold': p.lowStockThreshold,
        'stock_status': p.stockStatus,
        'image': p.imageUrl,
        'image_2': p.image2,
        'image_3': p.image3,
        'image_4': p.image4,
        'is_active': p.isActive,
        'sample_available': p.sampleAvailable,
        'sample_price': p.samplePrice,
        'sample_price_display': p.samplePriceDisplay,
        'custom_specifications': p.customSpecifications,
        'tiered_prices': p.tieredPrices
            .map((t) =>
                {'id': t.id, 'min_quantity': t.minQuantity, 'price': t.price})
            .toList(),
        'profit_margin': p.profitMargin,
        'profit_amount': p.profitAmount,
        'created_at': p.createdAt.toIso8601String(),
        'updated_at': p.updatedAt.toIso8601String(),
      };

  /// Add item enforcing MOQ. Returns error string or null on success.
  String? addItem(Product product, {int quantity = 1}) {
    final minQty = product.moq > 0 ? product.moq : 1;
    if (_items.containsKey(product.id)) {
      _items[product.id]!.quantity += quantity;
    } else {
      // Enforce MOQ on first add
      final effectiveQty = quantity < minQty ? minQty : quantity;
      _items[product.id] =
          CartItem(product: product, quantity: effectiveQty);
    }
    notifyListeners();
    _persist();
    return null;
  }

  void removeItem(int productId) {
    _items.remove(productId);
    notifyListeners();
    _persist();
  }

  void updateQuantity(int productId, int quantity) {
    if (_items.containsKey(productId)) {
      final minQty = _items[productId]!.product.moq;
      if (quantity <= 0) {
        _items.remove(productId);
      } else {
        _items[productId]!.quantity =
            quantity < minQty ? minQty : quantity;
      }
      notifyListeners();
      _persist();
    }
  }

  void decreaseQuantity(int productId) {
    if (_items.containsKey(productId)) {
      final item = _items[productId]!;
      final minQty = item.product.moq > 0 ? item.product.moq : 1;
      if (item.quantity > minQty) {
        item.quantity--;
      } else {
        _items.remove(productId);
      }
      notifyListeners();
      _persist();
    }
  }

  void increaseQuantity(int productId) {
    if (_items.containsKey(productId)) {
      _items[productId]!.quantity++;
      notifyListeners();
      _persist();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
    _persist();
  }

  List<Map<String, dynamic>> toOrderItems() {
    return _items.values
        .map((item) => {
              'product_id': item.product.id,
              'quantity': item.quantity,
            })
        .toList();
  }
}

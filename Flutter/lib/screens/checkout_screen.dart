import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/models/address.dart';
import 'package:flutter_mobile_app/models/order.dart' show ShippingAddress;
import 'package:flutter_mobile_app/providers/cart_provider.dart';
import 'package:flutter_mobile_app/services/user_service.dart';
import 'package:flutter_mobile_app/services/order_service.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final UserService _userService;
  late final OrderService _orderService;

  List<Address> _addresses = [];
  Address? _selectedAddress;
  bool _isLoadingAddresses = true;
  bool _isPlacingOrder = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final apiClient = context.read<ApiClient>();
    _userService = UserService(apiClient);
    _orderService = OrderService(apiClient);
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    final result = await _userService.getAddresses();
    if (result.isSuccess && result.data != null) {
      _addresses = result.data!;
      _selectedAddress = _addresses.where((a) => a.isDefault).firstOrNull ?? _addresses.firstOrNull;
    }
    setState(() => _isLoadingAddresses = false);
  }

  Future<void> _placeOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a shipping address')),
      );
      return;
    }

    final cart = context.read<CartProvider>();
    if (cart.items.isEmpty) return;

    setState(() {
      _isPlacingOrder = true;
      _error = null;
    });

    final orderItems = cart.items.map((item) => {
      'product': {'_id': item.product.id},
      'name': item.product.name,
      'quantity': item.quantity,
      'image': item.product.image ?? '',
      'price': item.product.price,
      if (item.variantId != null) 'variantId': item.variantId,
    }).toList();

    final shippingAddress = ShippingAddress(
      fullName: _selectedAddress!.fullName,
      streetAddress: _selectedAddress!.streetAddress,
      city: _selectedAddress!.city,
      state: _selectedAddress!.state,
      zipCode: _selectedAddress!.zipCode,
      phoneNumber: _selectedAddress!.phoneNumber,
    );

    final result = await _orderService.createOrder(
      orderItems: orderItems,
      shippingAddress: shippingAddress,
      totalPrice: cart.totalAmount,
      couponCode: cart.appliedCoupon,
    );

    if (result.isSuccess && mounted) {
      await cart.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
        Navigator.pop(context, true);
      }
    } else if (mounted) {
      setState(() {
        _error = result.error ?? 'Failed to place order';
        _isPlacingOrder = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoadingAddresses
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Shipping Address Section
                  const Text('Shipping Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (_addresses.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppTheme.borderColor),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Text('No addresses saved. Please add one in Profile > Addresses.',
                            style: TextStyle(color: AppTheme.textMuted), textAlign: TextAlign.center),
                      ),
                    )
                  else
                    ...List.generate(_addresses.length, (index) {
                      final addr = _addresses[index];
                      final isSelected = _selectedAddress?.id == addr.id;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedAddress = addr),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: isSelected ? AppTheme.primaryDefault : AppTheme.borderColor,
                              width: isSelected ? 2 : 1,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                                color: isSelected ? AppTheme.primaryDefault : AppTheme.textMuted,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(addr.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                                        if (addr.isDefault) ...[
                                          const SizedBox(width: 8),
                                          const Text('(Default)', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                                        ],
                                      ],
                                    ),
                                    Text('${addr.fullName} · ${addr.phoneNumber}',
                                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                                    Text('${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.zipCode}',
                                        style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),

                  const SizedBox(height: 24),

                  // Order Summary
                  const Text('Order Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ...cart.items.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: CachedNetworkImage(
                                imageUrl: item.product.image ?? '',
                                width: 56,
                                height: 56,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.product.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontWeight: FontWeight.w500)),
                                  Text('Qty: ${item.quantity}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                                ],
                              ),
                            ),
                            Text('\$${item.totalPrice.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      )),

                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontSize: 18)),
                      Text('\$${cart.totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryDefault)),
                    ],
                  ),

                  if (cart.appliedCoupon != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.discount_outlined, size: 16, color: AppTheme.accentSuccess),
                        const SizedBox(width: 4),
                        Text('Coupon: ${cart.appliedCoupon}', style: const TextStyle(color: AppTheme.accentSuccess)),
                      ],
                    ),
                  ],

                  if (_error != null) ...[
                    const SizedBox(height: 16),
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  ],

                  const SizedBox(height: 32),
                ],
              ),
            ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          border: const Border(top: BorderSide(color: AppTheme.borderColor)),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isPlacingOrder ? null : _placeOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryDefault,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isPlacingOrder
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Place Order', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ),
      ),
    );
  }
}

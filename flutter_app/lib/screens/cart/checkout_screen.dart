import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../../providers/auth_provider.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _step = 0; // 0: review, 1: shipping, 2: confirm
  final _formKey = GlobalKey<FormState>();
  final _nameC = TextEditingController();
  final _addressC = TextEditingController();
  final _cityC = TextEditingController();
  final _countryC = TextEditingController();
  final _phoneC = TextEditingController();
  final _notesC = TextEditingController();
  bool _placing = false;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    if (auth.user != null) {
      _nameC.text = auth.user!.displayName;
    }
  }

  @override
  void dispose() {
    _nameC.dispose();
    _addressC.dispose();
    _cityC.dispose();
    _countryC.dispose();
    _phoneC.dispose();
    _notesC.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: AppTheme.white,
        surfaceTintColor: Colors.transparent,
      ),
      body: Column(
        children: [
          // Steps indicator
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
            child: Row(
              children: [
                _stepDot(0, 'Review'),
                _stepLine(0),
                _stepDot(1, 'Shipping'),
                _stepLine(1),
                _stepDot(2, 'Confirm'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Content
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _step == 0
                  ? _reviewStep(cart)
                  : _step == 1
                      ? _shippingStep()
                      : _confirmStep(cart),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _bottomBar(context, cart),
    );
  }

  Widget _stepDot(int step, String label) {
    final active = _step >= step;
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: active ? AppTheme.primary : AppTheme.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: active && _step > step
                  ? const Icon(Icons.check_rounded,
                      size: 16, color: Colors.white)
                  : Text(
                      '${step + 1}',
                      style: TextStyle(
                        color: active ? Colors.white : AppTheme.textHint,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              color: active ? AppTheme.primary : AppTheme.textHint,
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepLine(int after) {
    return Expanded(
      flex: 0,
      child: Container(
        width: 32,
        height: 2,
        margin: const EdgeInsets.only(bottom: 14),
        color: _step > after ? AppTheme.primary : AppTheme.border,
      ),
    );
  }

  // ── Review Step ──
  Widget _reviewStep(CartProvider cart) {
    return ListView(
      key: const ValueKey('review'),
      padding: const EdgeInsets.all(16),
      children: [
        ...cart.itemList.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceVariant,
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusSm),
                    ),
                    child: const Icon(Icons.inventory_2_outlined,
                        size: 20, color: AppTheme.textHint),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.product.name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          'Qty: ${item.quantity} × \$${item.product.sellingPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '\$${item.totalPrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                ],
              ),
            )),
        const Divider(height: 24),
        _summaryRow('Subtotal', '\$${cart.subtotal.toStringAsFixed(2)}'),
        _summaryRow(
          'Shipping',
          cart.shippingCost == 0 ? 'FREE' : 'Calculated at next step',
          valueColor: cart.shippingCost == 0 ? AppTheme.success : null,
        ),
        const Divider(height: 16),
        _summaryRow(
          'Estimated Total',
          '\$${cart.total.toStringAsFixed(2)}',
          bold: true,
        ),
      ],
    );
  }

  // ── Shipping Step ──
  Widget _shippingStep() {
    return Form(
      key: const ValueKey('shipping'),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Form(
            key: _formKey,
            child: Column(
              children: [
                _field(_nameC, 'Full Name', Icons.person_outline,
                    required: true),
                const SizedBox(height: 12),
                _field(_phoneC, 'Phone', Icons.phone_outlined,
                    keyboard: TextInputType.phone, required: true),
                const SizedBox(height: 12),
                _field(_addressC, 'Address', Icons.location_on_outlined,
                    required: true),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                        child: _field(_cityC, 'City', Icons.location_city,
                            required: true)),
                    const SizedBox(width: 12),
                    Expanded(
                        child: _field(
                            _countryC, 'Country', Icons.public_outlined,
                            required: true)),
                  ],
                ),
                const SizedBox(height: 12),
                _field(_notesC, 'Order Notes (optional)',
                    Icons.note_alt_outlined,
                    maxLines: 3),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(TextEditingController c, String label, IconData icon,
      {bool required = false,
      TextInputType? keyboard,
      int maxLines = 1}) {
    return TextFormField(
      controller: c,
      keyboardType: keyboard,
      maxLines: maxLines,
      validator: required
          ? (v) => (v == null || v.isEmpty) ? '$label is required' : null
          : null,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        filled: true,
        fillColor: AppTheme.surfaceVariant,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide:
              const BorderSide(color: AppTheme.primary, width: 1.5),
        ),
      ),
    );
  }

  // ── Confirm Step ──
  Widget _confirmStep(CartProvider cart) {
    return ListView(
      key: const ValueKey('confirm'),
      padding: const EdgeInsets.all(16),
      children: [
        // Shipping info card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.local_shipping_outlined,
                      size: 18, color: AppTheme.primary),
                  SizedBox(width: 8),
                  Text(
                    'Shipping Details',
                    style: TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                ],
              ),
              const Divider(height: 16),
              _infoRow('Name', _nameC.text),
              _infoRow('Phone', _phoneC.text),
              _infoRow('Address', _addressC.text),
              _infoRow('City', _cityC.text),
              _infoRow('Country', _countryC.text),
              if (_notesC.text.isNotEmpty) _infoRow('Notes', _notesC.text),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Order summary
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.receipt_outlined,
                      size: 18, color: AppTheme.primary),
                  SizedBox(width: 8),
                  Text(
                    'Order Summary',
                    style: TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                ],
              ),
              const Divider(height: 16),
              _summaryRow(
                  '${cart.totalQuantity} items', '\$${cart.subtotal.toStringAsFixed(2)}'),
              _summaryRow(
                'Shipping',
                cart.shippingCost == 0 ? 'FREE' : 'TBD',
                valueColor: cart.shippingCost == 0 ? AppTheme.success : null,
              ),
              const Divider(height: 16),
              _summaryRow(
                'Total',
                '\$${cart.total.toStringAsFixed(2)}',
                bold: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(label,
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textSecondary)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value,
      {bool bold = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: bold ? FontWeight.w700 : FontWeight.normal,
                color: bold ? AppTheme.textPrimary : AppTheme.textSecondary,
              )),
          Text(value,
              style: TextStyle(
                fontSize: bold ? 16 : 13,
                fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                color: valueColor ?? AppTheme.textPrimary,
              )),
        ],
      ),
    );
  }

  Widget _bottomBar(BuildContext context, CartProvider cart) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      decoration: BoxDecoration(
        color: AppTheme.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_step > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: () => setState(() => _step--),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMd),
                    ),
                  ),
                  child: const Text('Back'),
                ),
              ),
            if (_step > 0) const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _placing ? null : () => _onNext(cart),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _step == 2
                      ? AppTheme.success
                      : AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusMd),
                  ),
                  elevation: 0,
                ),
                child: _placing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : Text(
                        _step == 0
                            ? 'Continue to Shipping'
                            : _step == 1
                                ? 'Review Order'
                                : 'Place Order',
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 15),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _onNext(CartProvider cart) {
    if (_step == 0) {
      setState(() => _step = 1);
    } else if (_step == 1) {
      if (_formKey.currentState?.validate() ?? false) {
        setState(() => _step = 2);
      }
    } else {
      _placeOrder(cart);
    }
  }

  Future<void> _placeOrder(CartProvider cart) async {
    setState(() => _placing = true);
    try {
      final op = context.read<OrderProvider>();
      final auth = context.read<AuthProvider>();
      final items = cart.itemList
          .map((i) => {
                'product_id': i.product.id,
                'quantity': i.quantity,
              })
          .toList();

      await op.placeOrder({
        'items': items,
        'customer_name': _nameC.text,
        'customer_email': auth.user?.email ?? '',
        'customer_phone': _phoneC.text,
        'customer_address': _addressC.text,
        'customer_city': _cityC.text,
        'customer_country': _countryC.text,
        'payment_method': 'bank_transfer',
        'notes': _notesC.text,
      });

      cart.clear();

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: AppTheme.success,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_rounded,
                      color: Colors.white, size: 32),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Order Placed!',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Your order has been placed successfully.\nWe\'ll notify you when it ships.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to place order: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }
}

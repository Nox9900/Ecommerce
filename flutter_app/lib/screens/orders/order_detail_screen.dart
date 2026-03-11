import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../models/order.dart';

class OrderDetailScreen extends StatelessWidget {
  final Order order;
  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${order.id.substring(order.id.length - 8)}'),
        backgroundColor: AppTheme.white,
        surfaceTintColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Order Progress ──
            _progressTracker(),
            const SizedBox(height: 20),

            // ── Order Info Card ──
            _infoCard(),
            const SizedBox(height: 16),

            // ── Items ──
            const Text(
              'Items',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            ...order.orderItems.map((item) => _itemTile(item)),

            // ── Summary ──
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surfaceVariant,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Column(
                children: [
                  _row('Subtotal',
                      '\$${order.totalPrice.toStringAsFixed(2)}'),
                  _row('Shipping', 'Included'),
                  const Divider(height: 16),
                  _row('Total', '\$${order.totalPrice.toStringAsFixed(2)}',
                      bold: true),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _progressTracker() {
    final steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    final currentIdx = switch (order.status) {
      'pending' => 0,
      'processing' || 'confirmed' => 1,
      'shipped' => 2,
      'delivered' || 'completed' => 3,
      _ => -1,
    };

    if (currentIdx < 0) {
      // cancelled / refunded
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.error.withAlpha(12),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppTheme.error.withAlpha(30)),
        ),
        child: Row(
          children: [
            const Icon(Icons.cancel_outlined,
                color: AppTheme.error, size: 22),
            const SizedBox(width: 10),
            Text(
              'Order ${order.status[0].toUpperCase()}${order.status.substring(1)}',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppTheme.error,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Row(
            children: List.generate(steps.length, (i) {
              final done = i <= currentIdx;
              final active = i == currentIdx;
              return Expanded(
                child: Column(
                  children: [
                    Row(
                      children: [
                        if (i > 0)
                          Expanded(
                            child: Container(
                              height: 2,
                              color: i <= currentIdx
                                  ? AppTheme.primary
                                  : AppTheme.border,
                            ),
                          ),
                        Container(
                          width: active ? 28 : 22,
                          height: active ? 28 : 22,
                          decoration: BoxDecoration(
                            color: done
                                ? AppTheme.primary
                                : AppTheme.surfaceVariant,
                            shape: BoxShape.circle,
                            border: active
                                ? Border.all(
                                    color:
                                        AppTheme.primary.withAlpha(60),
                                    width: 3,
                                  )
                                : null,
                          ),
                          child: Center(
                            child: done && !active
                                ? const Icon(Icons.check_rounded,
                                    size: 14, color: Colors.white)
                                : active
                                    ? Container(
                                        width: 8,
                                        height: 8,
                                        decoration: const BoxDecoration(
                                          color: Colors.white,
                                          shape: BoxShape.circle,
                                        ),
                                      )
                                    : null,
                          ),
                        ),
                        if (i < steps.length - 1)
                          Expanded(
                            child: Container(
                              height: 2,
                              color: i < currentIdx
                                  ? AppTheme.primary
                                  : AppTheme.border,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      steps[i],
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight:
                            active ? FontWeight.w600 : FontWeight.normal,
                        color: done
                            ? AppTheme.primary
                            : AppTheme.textHint,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _infoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          _infoRow('Order Number', '#${order.id.substring(order.id.length - 8)}'),
          _infoRow(
              'Date', DateFormat('MMMM d, yyyy').format(order.createdAt)),
          _infoRow(
              'Status',
              order.status[0].toUpperCase() + order.status.substring(1)),
          _infoRow('Payment', _paymentLabel()),
        ],
      ),
    );
  }

  String _paymentLabel() {
    final pr = order.paymentResult;
    if (pr == null) return 'Pending';
    final method = pr['method']?.toString() ?? '';
    return method.isNotEmpty
        ? method[0].toUpperCase() + method.substring(1)
        : 'Pending';
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 12, color: AppTheme.textSecondary)),
          Text(value,
              style: const TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _itemTile(OrderItem item) {
    return Container(
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
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: item.image != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    child: CachedNetworkImage(
                      imageUrl: item.image!.startsWith('http')
                          ? item.image!
                          : '${ApiConfig.baseUrl}${item.image}',
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => const Icon(
                          Icons.inventory_2_outlined,
                          size: 20,
                          color: AppTheme.textHint),
                    ),
                  )
                : const Icon(Icons.inventory_2_outlined,
                    size: 20, color: AppTheme.textHint),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Qty: ${item.quantity} × \$${item.price.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTheme.textHint,
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
    );
  }

  Widget _row(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: bold ? FontWeight.w700 : FontWeight.normal,
                color: bold
                    ? AppTheme.textPrimary
                    : AppTheme.textSecondary,
              )),
          Text(value,
              style: TextStyle(
                fontSize: bold ? 16 : 13,
                fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              )),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/vendor.dart';

class VendorCard extends StatelessWidget {
  final Vendor vendor;
  final VoidCallback? onTap;

  const VendorCard({super.key, required this.vendor, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppTheme.border),
          boxShadow: AppTheme.shadowSm,
        ),
        child: Row(
          children: [
            // Logo
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppTheme.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              clipBehavior: Clip.antiAlias,
              child: vendor.logo != null
                  ? CachedNetworkImage(
                      imageUrl: vendor.logo!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _logoPlaceholder(),
                    )
                  : _logoPlaceholder(),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          vendor.storeName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      _verificationBadge(),
                    ],
                  ),
                  const SizedBox(height: 3),
                  if (vendor.location.isNotEmpty)
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 12, color: AppTheme.textHint),
                        const SizedBox(width: 3),
                        Flexible(
                          child: Text(
                            vendor.location,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppTheme.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      // Rating
                      Icon(Icons.star_rounded,
                          size: 14, color: Colors.amber.shade700),
                      const SizedBox(width: 3),
                      Text(
                        vendor.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        ' (${vendor.totalReviews})',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textHint,
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Response rate
                      const Icon(Icons.speed_rounded,
                          size: 13, color: AppTheme.textHint),
                      const SizedBox(width: 3),
                      Text(
                        '${vendor.responseRate.toStringAsFixed(0)}%',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      if (vendor.isTradeAssurance) ...[
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.success.withAlpha(25),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Trade Assurance',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.success,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),
            const Icon(Icons.chevron_right_rounded,
                color: AppTheme.textHint, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _logoPlaceholder() {
    return Center(
      child: Text(
        vendor.storeName.isNotEmpty ? vendor.storeName[0].toUpperCase() : 'V',
        style: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: AppTheme.primary,
        ),
      ),
    );
  }

  Widget _verificationBadge() {
    Color color;
    IconData icon;
    switch (vendor.verificationLevel) {
      case 'gold':
        color = Colors.amber.shade700;
        icon = Icons.workspace_premium_rounded;
        break;
      case 'premium':
        color = AppTheme.primary;
        icon = Icons.verified_rounded;
        break;
      case 'verified':
        color = AppTheme.info;
        icon = Icons.verified_outlined;
        break;
      default:
        return const SizedBox.shrink();
    }
    return Icon(icon, size: 16, color: color);
  }
}

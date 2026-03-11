import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../screens/products/product_detail_screen.dart';

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final inCart = cart.isInCart(product.id);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(productId: product.id),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppTheme.border),
          boxShadow: AppTheme.shadowSm,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image area
            Expanded(
              flex: 5,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  product.imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: product.imageUrl!,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            color: AppTheme.surfaceVariant,
                            child: const Center(
                              child: Icon(Icons.image_outlined,
                                  color: AppTheme.textHint, size: 32),
                            ),
                          ),
                          errorWidget: (_, __, ___) => _placeholder(),
                        )
                      : _placeholder(),

                  // Out of stock overlay
                  if (!product.isInStock)
                    Container(
                      color: Colors.black54,
                      child: const Center(
                        child: Text(
                          'OUT OF STOCK',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),

                  // Badges
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (product.isLowStock && product.isInStock)
                          _badge('Low Stock', AppTheme.warning),
                        if (product.sampleAvailable)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: _badge('Sample', AppTheme.info),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Info area
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category
                    Text(
                      product.categoryName,
                      style: TextStyle(
                        fontSize: 10,
                        color: AppTheme.primary.withAlpha(180),
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),

                    // Name
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),

                    // Vendor
                    if (product.vendorName.isNotEmpty)
                      Text(
                        product.vendorName,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppTheme.textHint,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),

                    const Spacer(),

                    // MOQ
                    if (product.moq > 1)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          'MOQ: ${product.moq} pcs',
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),

                    // Price + cart button
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '\$${product.sellingPrice.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            ),
                          ),
                        ),
                        if (product.isInStock)
                          GestureDetector(
                            onTap: () {
                              if (inCart) {
                                cart.removeItem(product.id);
                              } else {
                                cart.addItem(product);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        '${product.name} added to cart'),
                                    duration: const Duration(seconds: 1),
                                  ),
                                );
                              }
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: inCart
                                    ? AppTheme.accent
                                    : AppTheme.primary,
                                borderRadius:
                                    BorderRadius.circular(AppTheme.radiusSm),
                              ),
                              child: Icon(
                                inCart
                                    ? Icons.check_rounded
                                    : Icons.add_shopping_cart_rounded,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: AppTheme.surfaceVariant,
      child: Center(
        child: Icon(
          Icons.inventory_2_outlined,
          color: AppTheme.textHint.withAlpha(100),
          size: 36,
        ),
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

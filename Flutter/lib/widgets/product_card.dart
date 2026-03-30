import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_mobile_app/models/product.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/providers/cart_provider.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final double? cardHeight;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.cardHeight,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppTheme.softShadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: (cardHeight ?? 0) > 150
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Larger Image for horizontal/trending
                    Expanded(
                      flex: 6,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: Hero(
                              tag: 'product_image_${product.id}',
                              child: (product.image != null && product.image!.isNotEmpty)
                                  ? CachedNetworkImage(
                                      imageUrl: product.image!,
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(color: Colors.grey[100]),
                                      errorWidget: (context, url, error) => const Icon(Icons.error),
                                    )
                                  : Container(color: Colors.grey[100], child: const Icon(Icons.image_not_supported, color: Colors.grey)),
                            ),
                          ),
                          // Premium badge if rating is high
                          if (product.averageRating >= 4.5)
                            Positioned(
                              top: 12,
                              left: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.6),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Text(
                                  'Top Rated',
                                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    Expanded(
                      flex: 4,
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  product.category,
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textMuted),
                                ),
                              ],
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '\$${product.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.star, size: 12, color: Colors.amber),
                                      const SizedBox(width: 2),
                                      Text(
                                        product.averageRating.toString(),
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Grid item card
                    Expanded(
                      flex: 7,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: Hero(
                              tag: 'product_image_${product.id}_grid',
                              child: (product.image != null && product.image!.isNotEmpty)
                                  ? CachedNetworkImage(
                                      imageUrl: product.image!,
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(color: Colors.grey[100]),
                                      errorWidget: (context, url, error) => const Icon(Icons.error),
                                    )
                                  : Container(color: Colors.grey[100], child: const Icon(Icons.image_not_supported, color: Colors.grey)),
                            ),
                          ),
                          Positioned(
                            right: 8,
                            bottom: -15, // Partially overlap content
                            child: _AddToCartButton(product: product),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              product.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '\$${product.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                  ),
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.star, size: 12, color: Colors.amber),
                                    const SizedBox(width: 2),
                                    Text(
                                      product.averageRating.toString(),
                                      style: const TextStyle(fontSize: 11),
                                    ),
                                  ],
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
      ),
    );
  }
}

class _AddToCartButton extends StatelessWidget {
  final Product product;
  const _AddToCartButton({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.read<CartProvider>().addItem(product);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.accentIndigo,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            content: Text('${product.name} added to cart!'),
            duration: const Duration(seconds: 1),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark 
            ? AppTheme.primaryDarkDefault 
            : AppTheme.primaryDefault,
          shape: BoxShape.circle,
          boxShadow: AppTheme.deepShadow,
        ),
        child: Icon(
          Icons.add_shopping_cart_rounded,
          size: 20,
          color: Theme.of(context).brightness == Brightness.dark 
            ? AppTheme.primaryDefault 
            : Colors.white,
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../models/product.dart';
import 'product_card.dart';

class ProductSection extends StatelessWidget {
  final String title;
  final List<Product> products;
  final Widget? icon;
  final VoidCallback? onSeeAll;
  final bool isGrid;

  const ProductSection({
    super.key,
    required this.title,
    required this.products,
    this.icon,
    this.onSeeAll,
    this.isGrid = false,
  });

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  if (icon != null) ...[
                    icon!,
                    const SizedBox(width: 8),
                  ],
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (onSeeAll != null)
                TextButton(
                  onPressed: onSeeAll,
                  child: const Text('See All'),
                ),
            ],
          ),
        ),
        isGrid
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  GridView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: products.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.75,
                    ),
                    itemBuilder: (context, index) {
                      return ProductCard(
                        product: products[index],
                        onTap: () {
                          // TODO: Navigate to detail
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 32),
                ],
              )
            : SizedBox(
                height: 280,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: products.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    return SizedBox(
                      width: 160,
                      child: ProductCard(
                        product: products[index],
                        onTap: () {
                          // TODO: Navigate to detail
                        },
                      ),
                    );
                  },
                ),
              ),
      ],
    );
  }
}

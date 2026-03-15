import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/models/category.dart';

typedef CategoryCallback = void Function(String categoryId);
typedef SubcategoryCallback = void Function(String subcategoryId);

class CategoryHeaderDelegate extends SliverPersistentHeaderDelegate {
  final BuildContext context;
  final String selectedCategoryId;
  final String? selectedSubcategoryId;
  final List<Category> categories;
  final CategoryCallback onCategorySelected;
  final VoidCallback onAllProducts;
  final SubcategoryCallback onSubcategorySelected;

  CategoryHeaderDelegate({
    required this.context,
    required this.selectedCategoryId,
    required this.selectedSubcategoryId,
    required this.categories,
    required this.onCategorySelected,
    required this.onAllProducts,
    required this.onSubcategorySelected,
  });

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: SizedBox(
        height: 48,
        child: Row(
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 16, right: 8),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: selectedCategoryId == 'all' ? Theme.of(context).colorScheme.primary : Colors.grey[200],
                  foregroundColor: selectedCategoryId == 'all' ? Colors.white : Colors.black,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                onPressed: onAllProducts,
                child: const Text('All Products'),
              ),
            ),
            Expanded(
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: EdgeInsets.zero,
                itemCount: categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final category = categories[index];
                  final isSelected = category.id == selectedCategoryId;
                  return ChoiceChip(
                    label: Text(category.name),
                    selected: isSelected,
                    onSelected: (selected) => onCategorySelected(category.id),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    backgroundColor: Colors.grey[200],
                    selectedColor: Theme.of(context).colorScheme.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.black,
                    ),
                    side: BorderSide.none,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  double get maxExtent => 48;

  @override
  double get minExtent => 48;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => true;
}
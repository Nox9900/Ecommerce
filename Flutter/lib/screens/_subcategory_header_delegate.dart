import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/models/category.dart';

typedef SubcategoryCallback = void Function(String subcategoryId);

class SubcategoryHeaderDelegate extends SliverPersistentHeaderDelegate {
  final BuildContext context;
  final String? selectedSubcategoryId;
  final List<Subcategory> subcategories;
  final SubcategoryCallback onSubcategorySelected;

  SubcategoryHeaderDelegate({
    required this.context,
    required this.selectedSubcategoryId,
    required this.subcategories,
    required this.onSubcategorySelected,
  });

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: SizedBox(
        height: 40,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: subcategories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, idx) {
            final subcat = subcategories[idx];
            final isSelected = subcat.id == selectedSubcategoryId;
            return ChoiceChip(
              label: Text(subcat.name),
              selected: isSelected,
              onSelected: (selected) => onSubcategorySelected(subcat.id),
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
    );
  }

  @override
  double get maxExtent => 40;

  @override
  double get minExtent => 40;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => true;
}
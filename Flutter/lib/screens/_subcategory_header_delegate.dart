import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/models/category.dart';
import 'package:flutter_mobile_app/core/theme.dart';

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
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Center(
        child: SizedBox(
          height: 32,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: subcategories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, idx) {
              final subcat = subcategories[idx];
              final isSelected = subcat.id == selectedSubcategoryId;
              
              return GestureDetector(
                onTap: () => onSubcategorySelected(subcat.id),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: isSelected 
                      ? AppTheme.accentIndigo.withOpacity(0.15)
                      : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppTheme.accentIndigo : AppTheme.borderColor.withOpacity(0.5),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    subcat.name,
                    style: TextStyle(
                      color: isSelected ? AppTheme.accentIndigo : AppTheme.textMuted,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  @override
  double get maxExtent => 44;

  @override
  double get minExtent => 44;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) =>
      true;
}

import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/models/category.dart';
import 'package:flutter_mobile_app/core/theme.dart';

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
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(
           bottom: BorderSide(
             color: overlapsContent ? AppTheme.borderColor.withOpacity(0.5) : Colors.transparent,
             width: 1,
           ),
        ),
      ),
      child: Center(
        child: SizedBox(
          height: 40,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: categories.length + 1,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final isAll = index == 0;
              final category = !isAll ? categories[index - 1] : null;
              final isSelected = isAll ? selectedCategoryId == 'all' : category?.id == selectedCategoryId;
              
              return GestureDetector(
                onTap: isAll ? onAllProducts : () => onCategorySelected(category!.id),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: isSelected 
                      ? (Theme.of(context).brightness == Brightness.dark ? Colors.white : AppTheme.primaryDefault)
                      : (Theme.of(context).brightness == Brightness.dark ? Colors.grey[900] : Colors.grey[200]),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: isSelected ? AppTheme.softShadow : null,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    isAll ? 'All' : category!.name,
                    style: TextStyle(
                      color: isSelected 
                        ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white)
                        : (Theme.of(context).brightness == Brightness.dark ? Colors.white70 : Colors.black87),
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      fontSize: 13,
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
  double get maxExtent => 60;

  @override
  double get minExtent => 60;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) =>
      true;
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../models/product.dart';
import '../../models/review.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../vendors/vendor_detail_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final int productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  Product? _product;
  List<Review> _reviews = [];
  bool _loading = true;
  String? _error;
  int _selectedImageIndex = 0;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = context.read<AuthProvider>().api;
      final data = await api.get('${ApiConfig.products}${widget.productId}/');
      setState(() {
        _product = Product.fromJson(data);
        _loading = false;
      });
      // Load reviews for this product
      try {
        final revData = await api.get(
          '${ApiConfig.reviews}?product=${widget.productId}&ordering=-created_at');
        final List results = revData['results'] ?? [];
        setState(() {
          _reviews = results.map((j) => Review.fromJson(j)).toList();
        });
      } catch (_) {
        // Reviews are optional
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _errorView()
              : _product == null
                  ? const Center(child: Text('Product not found'))
                  : _buildContent(context),
      bottomNavigationBar:
          _product != null && !_loading ? _buildBottomBar() : null,
    );
  }

  Widget _errorView() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline,
              size: 48, color: AppTheme.textHint.withAlpha(80)),
          const SizedBox(height: 12),
          Text(_error ?? 'Error loading product',
              style: const TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _load,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    final p = _product!;
    final images = p.allImages;

    return CustomScrollView(
      slivers: [
        // ── Image Gallery ──
        SliverAppBar(
          expandedHeight: 320,
          pinned: true,
          backgroundColor: AppTheme.white,
          leading: _circleButton(
            Icons.arrow_back_rounded,
            () => Navigator.pop(context),
          ),
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              children: [
                // Main image
                Positioned.fill(
                  child: images.isNotEmpty
                      ? Image.network(
                          images[_selectedImageIndex],
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => _imagePlaceholder(),
                        )
                      : _imagePlaceholder(),
                ),
                // Image dots at bottom
                if (images.length > 1)
                  Positioned(
                    bottom: 16,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        images.length,
                        (i) => GestureDetector(
                          onTap: () =>
                              setState(() => _selectedImageIndex = i),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: _selectedImageIndex == i ? 20 : 8,
                            height: 8,
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            decoration: BoxDecoration(
                              color: _selectedImageIndex == i
                                  ? AppTheme.primary
                                  : AppTheme.border,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                // Stock badge
                Positioned(
                  top: 80,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: p.stockStatus == 'in_stock'
                          ? AppTheme.success
                          : AppTheme.warning,
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusFull),
                    ),
                    child: Text(
                      p.stockStatus == 'in_stock'
                          ? 'In Stock'
                          : 'Low Stock',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // ── Product Info ──
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name & Category
                if (p.categoryName.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withAlpha(15),
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusSm),
                    ),
                    child: Text(
                      p.categoryName,
                      style: const TextStyle(
                        color: AppTheme.primary,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                Text(
                  p.name,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        height: 1.3,
                      ),
                ),
                const SizedBox(height: 12),

                // Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${p.sellingPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                    if (p.moq > 1) ...[
                      const SizedBox(width: 8),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 5),
                        child: Text(
                          '/ piece',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppTheme.textHint,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),

                // MOQ
                if (p.moq > 1) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.warning.withAlpha(20),
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusSm),
                      border: Border.all(
                          color: AppTheme.warning.withAlpha(40)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.inventory_outlined,
                            size: 14, color: AppTheme.warning),
                        const SizedBox(width: 6),
                        Text(
                          'Min. Order: ${p.moq} pieces',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.warning,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Sample availability
                if (p.sampleAvailable) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.success.withAlpha(15),
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusSm),
                      border: Border.all(
                          color: AppTheme.success.withAlpha(30)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.science_outlined,
                            size: 14, color: AppTheme.success),
                        const SizedBox(width: 6),
                        Text(
                          'Sample Available${(p.samplePriceDisplay ?? '').isNotEmpty ? ' · ${p.samplePriceDisplay}' : ''}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.success,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // ── Tiered Pricing ──
                if (p.tieredPrices.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text(
                    'Bulk Pricing',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.border),
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceVariant,
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(AppTheme.radiusMd),
                            ),
                          ),
                          child: const Row(
                            children: [
                              Expanded(
                                  flex: 2,
                                  child: Text('Quantity',
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600))),
                              Expanded(
                                  child: Text('Unit Price',
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600),
                                      textAlign: TextAlign.right)),
                            ],
                          ),
                        ),
                        ...p.tieredPrices.map((t) => Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: const BoxDecoration(
                                border: Border(
                                    top: BorderSide(
                                        color: AppTheme.border,
                                        width: 0.5)),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    flex: 2,
                                    child: Text(
                                      '${t.minQuantity}+ pcs',
                                      style: const TextStyle(fontSize: 13),
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      '\$${t.price.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.primary,
                                      ),
                                      textAlign: TextAlign.right,
                                    ),
                                  ),
                                ],
                              ),
                            )),
                      ],
                    ),
                  ),
                ],

                // ── Description ──
                if (p.description.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    p.description,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.textSecondary,
                      height: 1.6,
                    ),
                  ),
                ],

                // ── Specifications ──
                if (p.customSpecifications != null && p.customSpecifications!.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text(
                    'Specifications',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceVariant,
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    child: Column(
                      children: p.customSpecifications!.entries
                          .map(
                            (e) => Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              child: Row(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Text(
                                      e.key,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '${e.value}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      textAlign: TextAlign.right,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ],

                // ── Vendor Card ──
                if (p.vendorName.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text(
                    'Supplier',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: p.vendorId != null
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => VendorDetailScreen(
                                    vendorId: p.vendorId!),
                              ),
                            );
                          }
                        : null,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius:
                            BorderRadius.circular(AppTheme.radiusMd),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withAlpha(15),
                              borderRadius: BorderRadius.circular(
                                  AppTheme.radiusSm),
                            ),
                            child: const Icon(Icons.store_rounded,
                                color: AppTheme.primary, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.vendorName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                                const Text(
                                  'View supplier profile →',
                                  style: TextStyle(
                                    color: AppTheme.primary,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded,
                              color: AppTheme.textHint),
                        ],
                      ),
                    ),
                  ),
                ],

                // ── Reviews Section ──
                const SizedBox(height: 24),
                Row(
                  children: [
                    const Text(
                      'Customer Reviews',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: () => _showWriteReview(p),
                      icon: const Icon(Icons.rate_review_outlined, size: 16),
                      label: const Text('Write Review', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
                if (_reviews.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceVariant,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.reviews_outlined,
                            size: 32, color: AppTheme.textHint.withAlpha(80)),
                        const SizedBox(height: 8),
                        const Text(
                          'No reviews yet',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Be the first to review this product',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.textHint,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ...(_reviews.take(5).map((r) => _reviewCard(r))),
                if (_reviews.length > 5)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: TextButton(
                      onPressed: () {},
                      child: Text(
                        'See all ${_reviews.length} reviews',
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ),

                const SizedBox(height: 100), // Bottom spacing for bar
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _reviewCard(Review r) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withAlpha(15),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    r.reviewerName.isNotEmpty
                        ? r.reviewerName[0].toUpperCase()
                        : 'U',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          r.reviewerName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                        if (r.isVerifiedPurchase) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.success.withAlpha(15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Verified',
                              style: TextStyle(
                                fontSize: 9,
                                color: AppTheme.success,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      r.timeAgo,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.textHint,
                      ),
                    ),
                  ],
                ),
              ),
              // Stars
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(5, (i) {
                  return Icon(
                    i < r.rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    size: 14,
                    color: i < r.rating ? Colors.amber : AppTheme.textHint,
                  );
                }),
              ),
            ],
          ),
          if (r.title.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              r.title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
          if (r.comment.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              r.comment,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showWriteReview(Product product) {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to write a review')),
      );
      Navigator.pushNamed(context, '/login');
      return;
    }

    int rating = 5;
    final titleC = TextEditingController();
    final commentC = TextEditingController();
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
              20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Write a Review',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 16),
              // Star rating
              Row(
                children: List.generate(5, (i) {
                  return GestureDetector(
                    onTap: () => setSheetState(() => rating = i + 1),
                    child: Padding(
                      padding: const EdgeInsets.only(right: 4),
                      child: Icon(
                        i < rating
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        size: 32,
                        color: i < rating ? Colors.amber : AppTheme.textHint,
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleC,
                decoration: InputDecoration(
                  labelText: 'Title (optional)',
                  filled: true,
                  fillColor: AppTheme.surfaceVariant,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: commentC,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Your review',
                  filled: true,
                  fillColor: AppTheme.surfaceVariant,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          setSheetState(() => submitting = true);
                          try {
                            await auth.api.post(ApiConfig.reviews, body: {
                              'product': product.id,
                              'reviewer_name': auth.user?.displayName ?? 'Anonymous',
                              'reviewer_email': auth.user?.email ?? '',
                              'rating': rating,
                              'title': titleC.text,
                              'comment': commentC.text,
                            });
                            if (ctx.mounted) Navigator.pop(ctx);
                            _load(); // Refresh reviews
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Review submitted!')),
                              );
                            }
                          } catch (e) {
                            setSheetState(() => submitting = false);
                            if (ctx.mounted) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                SnackBar(
                                    content:
                                        Text('Failed to submit: $e')),
                              );
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMd),
                    ),
                  ),
                  child: submitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Submit Review'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showRequestQuote(Product product) {
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to request a quote')),
      );
      Navigator.pushNamed(context, '/login');
      return;
    }

    final qtyC = TextEditingController(text: '$_quantity');
    final priceC = TextEditingController();
    final notesC = TextEditingController();
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
              20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Request a Quote',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                product.name,
                style: const TextStyle(
                    fontSize: 13, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: qtyC,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Quantity',
                  filled: true,
                  fillColor: AppTheme.surfaceVariant,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: priceC,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Target Unit Price (optional)',
                  prefixText: '\$ ',
                  filled: true,
                  fillColor: AppTheme.surfaceVariant,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesC,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Notes (optional)',
                  filled: true,
                  fillColor: AppTheme.surfaceVariant,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: submitting
                      ? null
                      : () async {
                          setSheetState(() => submitting = true);
                          try {
                            final qty =
                                int.tryParse(qtyC.text) ?? _quantity;
                            final price = priceC.text.isNotEmpty
                                ? double.tryParse(priceC.text)
                                : null;
                            await auth.api
                                .post(ApiConfig.quotes, body: {
                              'notes': notesC.text,
                              'items': [
                                {
                                  'product': product.id,
                                  'quantity': qty,
                                  if (price != null)
                                    'target_price': price,
                                  'notes': notesC.text,
                                },
                              ],
                            });
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context)
                                  .showSnackBar(
                                const SnackBar(
                                    content:
                                        Text('Quote request submitted!')),
                              );
                            }
                          } catch (e) {
                            setSheetState(() => submitting = false);
                            if (ctx.mounted) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                SnackBar(
                                    content: Text('Failed: $e')),
                              );
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMd),
                    ),
                  ),
                  child: submitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Submit Quote Request'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
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
            // Quantity selector
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              child: Row(
                children: [
                  _qtyButton(Icons.remove_rounded, () {
                    if (_quantity > 1) setState(() => _quantity--);
                  }),
                  SizedBox(
                    width: 38,
                    child: Text(
                      '$_quantity',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                  ),
                  _qtyButton(Icons.add_rounded, () {
                    setState(() => _quantity++);
                  }),
                ],
              ),
            ),
            const SizedBox(width: 14),
            // Request Quote button
            SizedBox(
              height: 48,
              child: OutlinedButton(
                onPressed: () => _showRequestQuote(_product!),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.primary),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                ),
                child: const Icon(Icons.request_quote_outlined,
                    size: 18, color: AppTheme.primary),
              ),
            ),
            const SizedBox(width: 8),
            // Add to Cart button
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  context
                      .read<CartProvider>()
                      .addItem(_product!, quantity: _quantity);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          '${_product!.name} × $_quantity added to cart'),
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                icon: const Icon(Icons.shopping_cart_outlined, size: 18),
                label: Text(
                  'Add to Cart  ·  \$${(_product!.sellingPrice * _quantity).toStringAsFixed(2)}',
                ),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusMd),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _qtyButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Icon(icon, size: 18, color: AppTheme.textSecondary),
      ),
    );
  }

  Widget _circleButton(IconData icon, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: AppTheme.white,
            shape: BoxShape.circle,
            boxShadow: AppTheme.shadowSm,
          ),
          padding: const EdgeInsets.all(8),
          child: Icon(icon, size: 20),
        ),
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      color: AppTheme.surfaceVariant,
      child: Center(
        child: Icon(Icons.inventory_2_outlined,
            size: 64, color: AppTheme.textHint.withAlpha(80)),
      ),
    );
  }
}

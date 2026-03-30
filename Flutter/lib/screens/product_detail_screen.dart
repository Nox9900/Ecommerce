import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_mobile_app/models/product.dart';
import 'package:flutter_mobile_app/models/review.dart';
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/providers/cart_provider.dart';
import 'package:flutter_mobile_app/providers/wishlist_provider.dart';
import 'package:flutter_mobile_app/providers/chat_provider.dart';
import 'package:flutter_mobile_app/providers/auth_provider.dart';
import 'package:flutter_mobile_app/services/review_service.dart';
import 'package:flutter_mobile_app/screens/chat_screen.dart';

class ProductDetailScreen extends StatefulWidget { 
  final Product product;
  const ProductDetailScreen({super.key, required this.product});
  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _quantity = 1;
  List<Review> _reviews = [];
  bool _loadingReviews = false;

  @override
  void initState() {
    super.initState();
    _fetchReviews();
  }

  Future<void> _fetchReviews() async {
    setState(() => _loadingReviews = true);
    final reviewService = ReviewService(context.read<ApiClient>());
    final result = await reviewService.getProductReviews(widget.product.id);
    if (result.isSuccess && result.data != null) {
      _reviews = result.data!;
    }
    if (mounted) setState(() => _loadingReviews = false);
  }

  Future<void> _contactVendor() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to chat with the vendor')),
      );
      return;
    }

    final vendorId = widget.product.vendorId;
    if (vendorId == null || vendorId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vendor information not available')),
      );
      return;
    }

    final chatProvider = context.read<ChatProvider>();
    await chatProvider.startConversation(vendorId);

    // Find the newly created conversation
    final conversations = chatProvider.conversations;
    if (conversations.isNotEmpty && mounted) {
      final conv = conversations.first;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatScreen(
            conversationId: conv.id,
            receiverName: widget.product.shopName.isNotEmpty ? widget.product.shopName : 'Vendor',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Hero(
                tag: 'product_image_${widget.product.id}',
                child: PageView.builder(
                  itemCount: (widget.product.images != null && widget.product.images.isNotEmpty)
                      ? widget.product.images.length
                      : ((widget.product.image != null && widget.product.image!.isNotEmpty) ? 1 : 1),
                  itemBuilder: (context, index) {
                    String? imageUrl;
                    if (widget.product.images != null && widget.product.images.isNotEmpty) {
                      imageUrl = widget.product.images[index];
                    } else if (widget.product.image != null && widget.product.image!.isNotEmpty) {
                      imageUrl = widget.product.image;
                    } else {
                      imageUrl = null;
                    }
                    if (imageUrl == null || imageUrl.isEmpty) {
                      return Container(
                        color: Colors.grey[200],
                        child: const Center(child: Icon(Icons.image_not_supported, size: 48, color: Colors.grey)),
                      );
                    }
                    return CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: Colors.grey[200]),
                      errorWidget: (context, url, error) => const Icon(Icons.error),
                    );
                  },
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_outlined),
                onPressed: () {},
              ),
              Consumer<WishlistProvider>(
                builder: (context, wishlist, child) {
                  final isWishlisted = wishlist.isWishlisted(widget.product.id);
                  return IconButton(
                    icon: Icon(
                      isWishlisted ? Icons.favorite : Icons.favorite_border,
                      color: isWishlisted ? Colors.red : null,
                    ),
                    onPressed: () async => await wishlist.toggleWishlist(widget.product),
                  );
                },
              ),
            ],
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryDefault.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          widget.product.category.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryDefault,
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 20),
                          const SizedBox(width: 4),
                          Text(
                            widget.product.averageRating.toStringAsFixed(1),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            ' (${widget.product.totalReviews} reviews)',
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 14),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.product.name,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$${widget.product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primaryDefault,
                        ),
                      ),
                      // Quantity Picker
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 18),
                              onPressed: () {
                                if (_quantity > 1) {
                                  setState(() => _quantity--);
                                }
                              },
                            ),
                            Text(
                              '$_quantity',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 18),
                              onPressed: () {
                                setState(() => _quantity++);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Description',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.product.description,
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  const Divider(),
                  const SizedBox(height: 16),
                  
                  // Reviews Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Reviews',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('See All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_loadingReviews)
                    const Center(child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ))
                  else if (_reviews.isEmpty)
                    const Text('No reviews yet', style: TextStyle(color: AppTheme.textMuted))
                  else
                    ..._reviews.take(3).map((review) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundImage: review.userImage != null
                              ? NetworkImage(review.userImage!)
                              : null,
                          child: review.userImage == null ? const Icon(Icons.person) : null,
                        ),
                        title: Text(review.userName ?? 'User'),
                        subtitle: Text(review.comment ?? ''),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: List.generate(5, (index) => Icon(
                            Icons.star,
                            size: 14,
                            color: index < review.rating ? Colors.amber : Colors.grey[300],
                          )),
                        ),
                      ),
                    )),
                    
                  const SizedBox(height: 32),
                  const Text(
                    'Related Products',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  // This will be populated by fetchRelatedProducts in a real scenario
                  const Center(
                    child: Text('Loading recommendations...', style: TextStyle(color: AppTheme.textMuted)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          border: const Border(top: BorderSide(color: AppTheme.borderColor, width: 0.5)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.borderColor),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: IconButton(
                  icon: const Icon(Icons.chat_bubble_outline),
                  onPressed: _contactVendor,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    await context.read<CartProvider>().addItem(widget.product, quantity: _quantity);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Added $_quantity to cart!'),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryDefault,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(56),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Cart', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    await context.read<CartProvider>().addItem(widget.product, quantity: _quantity);
                    // Navigate to cart tab?
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryDefault,
                    side: const BorderSide(color: AppTheme.primaryDefault),
                    minimumSize: const Size.fromHeight(56),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Buy Now', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../models/vendor.dart';
import '../../models/product.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/product_card.dart';

class VendorDetailScreen extends StatefulWidget {
  final int vendorId;
  const VendorDetailScreen({super.key, required this.vendorId});

  @override
  State<VendorDetailScreen> createState() => _VendorDetailScreenState();
}

class _VendorDetailScreenState extends State<VendorDetailScreen> {
  Vendor? _vendor;
  List<Product> _products = [];
  bool _loading = true;
  String? _error;

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
      final data = await api.get('${ApiConfig.vendors}${widget.vendorId}/');
      setState(() {
        _vendor = Vendor.fromJson(data);
      });

      // fetch vendor products
      try {
        final prodData = await api
            .get('${ApiConfig.products}?vendor=${widget.vendorId}');
        final List list = prodData is List
            ? prodData
            : (prodData['results'] ?? []);
        setState(() {
          _products =
              list.map<Product>((j) => Product.fromJson(j)).toList();
        });
      } catch (_) {
        // products optional
      }

      setState(() => _loading = false);
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
      appBar: AppBar(
        title: Text(_vendor?.storeName ?? 'Supplier'),
        backgroundColor: AppTheme.white,
        surfaceTintColor: Colors.transparent,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!,
                          style: const TextStyle(
                              color: AppTheme.textSecondary)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                          onPressed: _load, child: const Text('Retry')),
                    ],
                  ),
                )
              : _buildContent(),
      floatingActionButton: _vendor?.phone != null && _vendor!.phone!.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: () {
                final phone = _vendor!.phone!.replaceAll(RegExp(r'[^0-9+]'), '');
                launchUrl(Uri.parse('https://wa.me/$phone'));
              },
              backgroundColor: const Color(0xFF25D366),
              icon: const Icon(Icons.chat_rounded, color: Colors.white),
              label: const Text('WhatsApp',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            )
          : null,
    );
  }

  Widget _buildContent() {
    final v = _vendor!;
    final width = MediaQuery.of(context).size.width;
    final isWide = width > 700;

    return RefreshIndicator(
      onRefresh: _load,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header Banner ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: AppTheme.heroGradient,
              ),
              child: Column(
                children: [
                  // Logo
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.shadowMd,
                    ),
                    child: v.logo != null
                        ? ClipOval(
                            child: Image.network(v.logo!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    _logoPlaceholder(v)),
                          )
                        : _logoPlaceholder(v),
                  ),
                  const SizedBox(height: 12),

                  // Store name
                  Text(
                    v.storeName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),

                  // Location
                  if (v.location.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 14, color: Colors.white70),
                        const SizedBox(width: 4),
                        Text(
                          v.location,
                          style: const TextStyle(
                              color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ],

                  // Verification badge
                  if (v.badgeLabel.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(25),
                        borderRadius:
                            BorderRadius.circular(AppTheme.radiusFull),
                        border:
                            Border.all(color: Colors.white.withAlpha(40)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            v.verificationLevel == 'gold'
                                ? Icons.workspace_premium_rounded
                                : Icons.verified_rounded,
                            size: 14,
                            color: Colors.amber.shade300,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            v.badgeLabel,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // ── Stats Row ──
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  _stat('Rating', v.rating > 0 ? v.rating.toStringAsFixed(1) : 'N/A',
                      Icons.star_rounded, Colors.amber),
                  _stat('Reviews', '${v.totalReviews}',
                      Icons.rate_review_outlined, AppTheme.info),
                  _stat('Response', v.responseRate > 0 ? '${v.responseRate.toStringAsFixed(0)}%' : 'N/A',
                      Icons.reply_rounded, AppTheme.success),
                  _stat('On-Time', v.onTimeDeliveryRate > 0 ? '${v.onTimeDeliveryRate.toStringAsFixed(0)}%' : 'N/A',
                      Icons.local_shipping_outlined, AppTheme.primary),
                ],
              ),
            ),

            // ── Description ──
            if (v.description.isNotEmpty) ...[
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'About',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Text(
                  v.description,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.textSecondary,
                    height: 1.6,
                  ),
                ),
              ),
            ],

            // ── Info Cards ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  if (v.isTradeAssurance)
                    _infoChip(Icons.shield_outlined, 'Trade Assurance',
                        AppTheme.success),
                  if (v.responseTimeDisplay.isNotEmpty)
                    _infoChip(Icons.access_time_rounded,
                        'Response: ${v.responseTimeDisplay}', AppTheme.info),
                  if (v.totalTransactions > 0)
                    _infoChip(Icons.receipt_long_outlined,
                        '${v.totalTransactions} Transactions', AppTheme.primary),
                  if (v.followerCount > 0)
                    _infoChip(Icons.people_outline_rounded,
                        '${v.followerCount} Followers', AppTheme.accent),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Products ──
            if (_products.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Products (${_products.length})',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _products.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: isWide ? 4 : 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: isWide ? 0.72 : 0.62,
                  ),
                  itemBuilder: (_, i) =>
                      ProductCard(product: _products[i]),
                ),
              ),
            ],

            if (_products.isEmpty && !_loading)
              const Padding(
                padding: EdgeInsets.all(32),
                child: Center(
                  child: Text(
                    'No products listed yet',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ),
              ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _stat(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withAlpha(12),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                color: AppTheme.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(12),
        borderRadius: BorderRadius.circular(AppTheme.radiusFull),
        border: Border.all(color: color.withAlpha(30)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _logoPlaceholder(Vendor v) {
    return Center(
      child: Text(
        v.storeName.isNotEmpty ? v.storeName[0].toUpperCase() : 'V',
        style: const TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: AppTheme.primary,
        ),
      ),
    );
  }
}

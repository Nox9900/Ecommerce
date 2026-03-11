import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../models/vendor.dart';
import '../../models/product.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/product_card.dart';

class VendorDetailScreen extends StatefulWidget {
  final String vendorId;
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
      final data = await api.get(ApiConfig.vendor(widget.vendorId));
      setState(() {
        _vendor = Vendor.fromJson(data);
      });

      // fetch vendor products
      try {
        final prodData = await api.get(
          ApiConfig.products,
          queryParams: {'vendor': widget.vendorId},
        );
        List list = [];
        if (prodData is List) {
          list = prodData;
        } else if (prodData is Map) {
          list = prodData['products'] ?? [];
        }
        setState(() {
          _products = list.map<Product>((j) => Product.fromJson(j)).toList();
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
        title: Text(_vendor?.shopName ?? 'Shop'),
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
            // Header Banner
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
                    child: v.logoUrl != null
                        ? ClipOval(
                            child: Image.network(v.logoUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    _logoPlaceholder(v)),
                          )
                        : _logoPlaceholder(v),
                  ),
                  const SizedBox(height: 12),

                  // Shop name
                  Text(
                    v.shopName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),

                  // Status badge
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
                          v.isApproved
                              ? Icons.verified_rounded
                              : Icons.schedule_rounded,
                          size: 14,
                          color: v.isApproved
                              ? Colors.greenAccent.shade200
                              : Colors.amber.shade300,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          v.isApproved ? 'Verified Seller' : 'Pending Verification',
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
              ),
            ),

            // Description
            if (v.description.isNotEmpty) ...[
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
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

            // Info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  if (v.commissionRate > 0)
                    _infoRow('Commission Rate', '${v.commissionRate}%'),
                  _infoRow('Member Since',
                      '${v.createdAt.month}/${v.createdAt.year}'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Products
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

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 12, color: AppTheme.textSecondary)),
          Text(value,
              style: const TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _logoPlaceholder(Vendor v) {
    return Center(
      child: Text(
        v.shopName.isNotEmpty ? v.shopName[0].toUpperCase() : 'V',
        style: const TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: AppTheme.primary,
        ),
      ),
    );
  }
}
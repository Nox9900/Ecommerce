import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/vendor_provider.dart';
import '../../widgets/vendor_card.dart';
import 'vendor_detail_screen.dart';

class VendorsScreen extends StatefulWidget {
  const VendorsScreen({super.key});

  @override
  State<VendorsScreen> createState() => _VendorsScreenState();
}

class _VendorsScreenState extends State<VendorsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VendorProvider>().fetchVendors();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vp = context.watch<VendorProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Suppliers'),
        backgroundColor: AppTheme.white,
        surfaceTintColor: Colors.transparent,
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search suppliers...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          vp.setSearch('');
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppTheme.surfaceVariant,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  borderSide:
                      const BorderSide(color: AppTheme.primary, width: 1.5),
                ),
              ),
              onChanged: (v) {
                vp.setSearch(v);
                setState(() {});
              },
            ),
          ),

          // Results count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text(
                  '${vp.vendors.length} suppliers',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Vendor List
          Expanded(
            child: vp.loading && vp.vendors.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : vp.vendors.isEmpty
                    ? _emptyState()
                    : RefreshIndicator(
                        onRefresh: () => vp.fetchVendors(),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: vp.vendors.length,
                          itemBuilder: (_, i) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: VendorCard(
                              vendor: vp.vendors[i],
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => VendorDetailScreen(
                                        vendorId: vp.vendors[i].id),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.store_outlined,
              size: 64, color: AppTheme.textHint.withAlpha(80)),
          const SizedBox(height: 16),
          const Text(
            'No suppliers found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try a different search',
            style: TextStyle(fontSize: 13, color: AppTheme.textHint),
          ),
        ],
      ),
    );
  }
}

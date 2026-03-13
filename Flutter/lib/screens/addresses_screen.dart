import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/models/address.dart';
import 'package:flutter_mobile_app/services/user_service.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  late final UserService _userService;
  List<Address> _addresses = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _userService = UserService(context.read<ApiClient>());
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final result = await _userService.getAddresses();
    if (result.isSuccess && result.data != null) {
      _addresses = result.data!;
    } else {
      _error = result.error ?? 'Failed to load addresses';
    }

    setState(() => _isLoading = false);
  }

  Future<void> _deleteAddress(String addressId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text('Are you sure you want to delete this address?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirmed == true) {
      final result = await _userService.deleteAddress(addressId);
      if (result.isSuccess) {
        _fetchAddresses();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.error ?? 'Failed to delete')),
        );
      }
    }
  }

  void _showAddressForm({Address? existing}) {
    final labelCtrl = TextEditingController(text: existing?.label ?? '');
    final nameCtrl = TextEditingController(text: existing?.fullName ?? '');
    final streetCtrl = TextEditingController(text: existing?.streetAddress ?? '');
    final cityCtrl = TextEditingController(text: existing?.city ?? '');
    final stateCtrl = TextEditingController(text: existing?.state ?? '');
    final zipCtrl = TextEditingController(text: existing?.zipCode ?? '');
    final phoneCtrl = TextEditingController(text: existing?.phoneNumber ?? '');
    bool isDefault = existing?.isDefault ?? false;
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    existing != null ? 'Edit Address' : 'Add Address',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: labelCtrl,
                    decoration: const InputDecoration(labelText: 'Label (Home, Work, etc.)'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: streetCtrl,
                    decoration: const InputDecoration(labelText: 'Street Address'),
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: cityCtrl,
                          decoration: const InputDecoration(labelText: 'City'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: stateCtrl,
                          decoration: const InputDecoration(labelText: 'State'),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: zipCtrl,
                          decoration: const InputDecoration(labelText: 'ZIP Code'),
                          keyboardType: TextInputType.number,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: phoneCtrl,
                          decoration: const InputDecoration(labelText: 'Phone'),
                          keyboardType: TextInputType.phone,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('Default Address'),
                    value: isDefault,
                    onChanged: (v) => setModalState(() => isDefault = v),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () async {
                      if (!formKey.currentState!.validate()) return;

                      final address = Address(
                        id: existing?.id ?? '',
                        label: labelCtrl.text.trim(),
                        fullName: nameCtrl.text.trim(),
                        streetAddress: streetCtrl.text.trim(),
                        city: cityCtrl.text.trim(),
                        state: stateCtrl.text.trim(),
                        zipCode: zipCtrl.text.trim(),
                        phoneNumber: phoneCtrl.text.trim(),
                        isDefault: isDefault,
                      );

                      final result = existing != null && existing.id != null
                          ? await _userService.updateAddress(existing.id!, address)
                          : await _userService.addAddress(address);

                      if (result.isSuccess && ctx.mounted) {
                        Navigator.pop(ctx);
                        _fetchAddresses();
                      } else if (ctx.mounted) {
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          SnackBar(content: Text(result.error ?? 'Failed to save')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryDefault,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(existing != null ? 'Update' : 'Add Address'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Addresses', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddressForm(),
        backgroundColor: AppTheme.primaryDefault,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 60, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(_error!, style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _fetchAddresses, child: const Text('Retry')),
                    ],
                  ),
                )
              : _addresses.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.location_off_outlined, size: 80, color: AppTheme.textMuted),
                          SizedBox(height: 16),
                          Text('No addresses saved', style: TextStyle(fontSize: 18, color: AppTheme.textMuted)),
                          SizedBox(height: 8),
                          Text('Tap + to add one', style: TextStyle(color: AppTheme.textMuted)),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchAddresses,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _addresses.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final addr = _addresses[index];
                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardColor,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: addr.isDefault ? AppTheme.primaryDefault : AppTheme.borderColor,
                                width: addr.isDefault ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(addr.label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    if (addr.isDefault) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryDefault.withAlpha(25),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text('Default', style: TextStyle(fontSize: 11, color: AppTheme.primaryDefault, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                    const Spacer(),
                                    IconButton(
                                      icon: const Icon(Icons.edit_outlined, size: 20),
                                      onPressed: () => _showAddressForm(existing: addr),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                                      onPressed: () { if (addr.id != null) _deleteAddress(addr.id!); },
                                    ),
                                  ],
                                ),
                                Text(addr.fullName, style: const TextStyle(fontWeight: FontWeight.w500)),
                                const SizedBox(height: 4),
                                Text('${addr.streetAddress}\n${addr.city}, ${addr.state} ${addr.zipCode}',
                                    style: const TextStyle(color: AppTheme.textSecondary, height: 1.4)),
                                const SizedBox(height: 4),
                                Text(addr.phoneNumber, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameC = TextEditingController();
  final _emailC = TextEditingController();
  final _firstNameC = TextEditingController();
  final _lastNameC = TextEditingController();
  final _companyNameC = TextEditingController();
  final _phoneC = TextEditingController();
  final _passwordC = TextEditingController();
  final _confirmPasswordC = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  int _step = 0; // 0: info, 1: password

  @override
  void dispose() {
    _usernameC.dispose();
    _emailC.dispose();
    _firstNameC.dispose();
    _lastNameC.dispose();
    _companyNameC.dispose();
    _phoneC.dispose();
    _passwordC.dispose();
    _confirmPasswordC.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppTheme.shadowLg,
                    ),
                    child: const Icon(Icons.person_add_rounded,
                        size: 28, color: Colors.white),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Create Account',
                    style: Theme.of(context)
                        .textTheme
                        .headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Join the Yaamaan marketplace',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 14),
                  ),
                  const SizedBox(height: 8),

                  // Step indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _stepPill(0, 'Account Info'),
                      const SizedBox(width: 8),
                      _stepPill(1, 'Password'),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Form
                  Form(
                    key: _formKey,
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: _step == 0 ? _infoStep() : _passwordStep(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Next/Register button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _onNext,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                        ),
                        elevation: 0,
                      ),
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : Text(
                              _step == 0 ? 'Continue' : 'Create Account',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                              ),
                            ),
                    ),
                  ),

                  if (_step > 0) ...[
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => setState(() => _step = 0),
                      child: const Text('← Back'),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Login link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Already have an account? ',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 13),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const LoginScreen()),
                          );
                        },
                        child: const Text(
                          'Sign In',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _stepPill(int step, String label) {
    final active = _step == step;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      decoration: BoxDecoration(
        color: active ? AppTheme.primary.withAlpha(15) : Colors.transparent,
        borderRadius: BorderRadius.circular(AppTheme.radiusFull),
        border: Border.all(
          color: active ? AppTheme.primary : AppTheme.border,
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: active ? FontWeight.w600 : FontWeight.normal,
          color: active ? AppTheme.primary : AppTheme.textHint,
        ),
      ),
    );
  }

  Widget _infoStep() {
    return Column(
      key: const ValueKey('info'),
      children: [
        Row(
          children: [
            Expanded(child: _field(_firstNameC, 'First Name', Icons.badge_outlined)),
            const SizedBox(width: 12),
            Expanded(child: _field(_lastNameC, 'Last Name', Icons.badge_outlined)),
          ],
        ),
        const SizedBox(height: 14),
        _field(_usernameC, 'Username', Icons.alternate_email_rounded,
            validator: (v) {
          if (v == null || v.isEmpty) return 'Required';
          if (v.length < 3) return 'Min 3 characters';
          return null;
        }),
        const SizedBox(height: 14),
        _field(_emailC, 'Email', Icons.email_outlined,
            keyboard: TextInputType.emailAddress, validator: (v) {
          if (v == null || v.isEmpty) return 'Required';
          if (!v.contains('@')) return 'Invalid email';
          return null;
        }),
        const SizedBox(height: 14),
        _field(_companyNameC, 'Company Name (optional)',
            Icons.business_outlined,
            validator: (_) => null),
        const SizedBox(height: 14),
        _field(_phoneC, 'Phone (optional)', Icons.phone_outlined,
            keyboard: TextInputType.phone, validator: (_) => null),
      ],
    );
  }

  Widget _passwordStep() {
    return Column(
      key: const ValueKey('password'),
      children: [
        _field(_passwordC, 'Password', Icons.lock_outline_rounded,
            obscure: _obscure,
            suffix: IconButton(
              icon: Icon(
                _obscure
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: AppTheme.textHint,
              ),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
            validator: (v) {
          if (v == null || v.isEmpty) return 'Required';
          if (v.length < 8) return 'Min 8 characters';
          return null;
        }),
        const SizedBox(height: 14),
        _field(
            _confirmPasswordC, 'Confirm Password', Icons.lock_outline_rounded,
            obscure: true, validator: (v) {
          if (v != _passwordC.text) return 'Passwords don\'t match';
          return null;
        }),
        const SizedBox(height: 14),
        // Password requirements
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.surfaceVariant,
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Password Requirements',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              _req('At least 8 characters', _passwordC.text.length >= 8),
              _req('Contains a number',
                  _passwordC.text.contains(RegExp(r'[0-9]'))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _req(String text, bool met) {
    return Padding(
      padding: const EdgeInsets.only(top: 3),
      child: Row(
        children: [
          Icon(
            met ? Icons.check_circle_rounded : Icons.circle_outlined,
            size: 14,
            color: met ? AppTheme.success : AppTheme.textHint,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 11,
              color: met ? AppTheme.success : AppTheme.textHint,
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(TextEditingController c, String label, IconData icon,
      {bool obscure = false,
      Widget? suffix,
      TextInputType? keyboard,
      String? Function(String?)? validator}) {
    return TextFormField(
      controller: c,
      obscureText: obscure,
      keyboardType: keyboard,
      validator: validator ??
          (v) => (v == null || v.isEmpty) ? '$label is required' : null,
      onChanged: (_) {
        if (_step == 1) setState(() {}); // refresh pw requirements
      },
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        suffixIcon: suffix,
        filled: true,
        fillColor: AppTheme.surfaceVariant,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide:
              const BorderSide(color: AppTheme.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide: const BorderSide(color: AppTheme.error, width: 1),
        ),
      ),
    );
  }

  void _onNext() {
    if (_step == 0) {
      if (_formKey.currentState?.validate() ?? false) {
        setState(() => _step = 1);
      }
    } else {
      if (_formKey.currentState?.validate() ?? false) {
        _register();
      }
    }
  }

  Future<void> _register() async {
    setState(() => _loading = true);
    try {
      final auth = context.read<AuthProvider>();
      await auth.register(
        username: _usernameC.text.trim(),
        email: _emailC.text.trim(),
        password: _passwordC.text,
        firstName: _firstNameC.text.trim(),
        lastName: _lastNameC.text.trim(),
        companyName: _companyNameC.text.trim().isNotEmpty
            ? _companyNameC.text.trim()
            : null,
        phone: _phoneC.text.trim().isNotEmpty ? _phoneC.text.trim() : null,
      );

      if (mounted && auth.isLoggedIn) {
        Navigator.pop(context);
      } else if (mounted && auth.error != null) {
        _showError(auth.error!);
      }
    } catch (e) {
      if (mounted) _showError(e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppTheme.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

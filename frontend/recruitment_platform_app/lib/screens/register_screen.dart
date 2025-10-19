import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

enum _RegisterStep { form, otp }

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();

  static const Duration _resendCooldown = Duration(seconds: 30);

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isVerifyingOtp = false;
  bool _isResendingOtp = false;
  _RegisterStep _step = _RegisterStep.form;
  DateTime? _resendAvailableAt;
  Timer? _resendTimer;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    _resendTimer?.cancel();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.register(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isLoading = false;
    });

    if (success) {
      HapticFeedback.lightImpact();
      _otpController.clear();
      _scheduleResendAvailability(_resendCooldown);
      setState(() {
        _step = _RegisterStep.otp;
        _isVerifyingOtp = false;
        _isResendingOtp = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'We\'ve sent a verification code to ${_emailController.text.trim()}',
          ),
        ),
      );
    } else {
      final error = authProvider.error ?? 'Failed to register';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red.shade700),
      );
    }
  }

  Future<void> _verifyOtp() async {
    if (!_otpFormKey.currentState!.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _isVerifyingOtp = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.verifyEmailOtp(
      _emailController.text.trim(),
      _otpController.text.trim(),
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isVerifyingOtp = false;
    });

    if (success) {
      HapticFeedback.mediumImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email verified! You can now sign in.')),
      );
      Navigator.of(context).pop();
    } else {
      final error = authProvider.error ?? 'Failed to verify code';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red.shade700),
      );
    }
  }

  Future<void> _resendOtp() async {
    if (!_canResend) return;

    setState(() {
      _isResendingOtp = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.resendVerificationOtp(
      _emailController.text.trim(),
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isResendingOtp = false;
    });

    if (success) {
      HapticFeedback.lightImpact();
      _scheduleResendAvailability(_resendCooldown);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('A new verification code has been sent.')),
      );
    } else {
      final error = authProvider.error ?? 'Failed to resend verification code';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red.shade700),
      );
    }
  }

  void _restartRegistration() {
    _resendTimer?.cancel();
    setState(() {
      _step = _RegisterStep.form;
      _otpController.clear();
      _resendAvailableAt = null;
      _isResendingOtp = false;
      _isVerifyingOtp = false;
    });
  }

  void _scheduleResendAvailability(Duration duration) {
    _resendTimer?.cancel();
    _resendAvailableAt = DateTime.now().add(duration);
    _resendTimer = Timer(duration, () {
      if (mounted) {
        setState(() {});
      }
    });
  }

  bool get _canResend =>
      _resendAvailableAt == null || DateTime.now().isAfter(_resendAvailableAt!);

  int get _remainingResendSeconds {
    if (_resendAvailableAt == null) return 0;
    final seconds = _resendAvailableAt!.difference(DateTime.now()).inSeconds;
    return seconds > 0 ? seconds : 0;
  }

  Widget _buildRegisterForm(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Container(
              height: 54,
              width: 54,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: theme.colorScheme.primary.withOpacity(0.12),
              ),
              child: Icon(
                Icons.rocket_launch_outlined,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Create your account',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Join the recruitment platform and access tailored opportunities.',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        TextFormField(
          controller: _emailController,
          decoration: const InputDecoration(
            labelText: 'Email address',
            prefixIcon: Icon(Icons.email_outlined),
          ),
          keyboardType: TextInputType.emailAddress,
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Email is required';
            }
            final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
            if (!emailRegex.hasMatch(value.trim())) {
              return 'Please enter a valid email address';
            }
            return null;
          },
        ),
        const SizedBox(height: 20),
        TextFormField(
          controller: _passwordController,
          decoration: InputDecoration(
            labelText: 'Password',
            prefixIcon: const Icon(Icons.lock_outline),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
          obscureText: _obscurePassword,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Password is required';
            }
            if (value.length < 8) {
              return 'Password must be at least 8 characters long';
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        Text(
          'Use at least 8 characters including numbers and symbols.',
          style: theme.textTheme.bodySmall,
        ),
        const SizedBox(height: 20),
        TextFormField(
          controller: _confirmPasswordController,
          decoration: InputDecoration(
            labelText: 'Confirm password',
            prefixIcon: const Icon(Icons.lock_person_outlined),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirmPassword
                    ? Icons.visibility_off
                    : Icons.visibility,
              ),
              onPressed: () {
                setState(() {
                  _obscureConfirmPassword = !_obscureConfirmPassword;
                });
              },
            ),
          ),
          obscureText: _obscureConfirmPassword,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please confirm your password';
            }
            if (value != _passwordController.text) {
              return 'Passwords do not match';
            }
            return null;
          },
        ),
        const SizedBox(height: 32),
        FilledButton(
          onPressed: _isLoading ? null : _register,
          child:
              _isLoading
                  ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                  : const Text('Create account'),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Already have an account? Sign in'),
        ),
      ],
    );
  }

  Widget _buildOtpForm(ThemeData theme) {
    final remainingSeconds = _remainingResendSeconds;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Container(
              height: 54,
              width: 54,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: theme.colorScheme.primary.withOpacity(0.12),
              ),
              child: Icon(
                Icons.mark_email_unread_outlined,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Verify your email',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Enter the 6-digit code we sent to ${_emailController.text.trim()}.',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        TextFormField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          decoration: const InputDecoration(
            labelText: 'Verification code',
            prefixIcon: Icon(Icons.pin_outlined),
          ),
          inputFormatters: const [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Please enter the code';
            }
            if (value.trim().length != 6) {
              return 'The code must be 6 digits';
            }
            return null;
          },
        ),
        const SizedBox(height: 32),
        FilledButton(
          onPressed: _isVerifyingOtp ? null : _verifyOtp,
          child:
              _isVerifyingOtp
                  ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                  : const Text('Verify email'),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: (_isResendingOtp || !_canResend) ? null : _resendOtp,
          icon:
              _isResendingOtp
                  ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                  : const Icon(Icons.refresh_outlined),
          label: Text(
            _canResend
                ? 'Resend code'
                : 'Resend available in ${remainingSeconds}s',
          ),
        ),
        if (!_canResend)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Please wait before requesting another code.',
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: _isVerifyingOtp ? null : _restartRegistration,
          child: const Text('Change email'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              theme.colorScheme.primary.withOpacity(0.12),
              theme.colorScheme.secondary.withOpacity(0.10),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 25,
                        offset: const Offset(0, 20),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 28,
                      vertical: 32,
                    ),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      switchInCurve: Curves.easeOut,
                      switchOutCurve: Curves.easeIn,
                      child:
                          _step == _RegisterStep.form
                              ? KeyedSubtree(
                                key: const ValueKey('register-form'),
                                child: Form(
                                  key: _formKey,
                                  child: _buildRegisterForm(theme),
                                ),
                              )
                              : KeyedSubtree(
                                key: const ValueKey('otp-form'),
                                child: Form(
                                  key: _otpFormKey,
                                  child: _buildOtpForm(theme),
                                ),
                              ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

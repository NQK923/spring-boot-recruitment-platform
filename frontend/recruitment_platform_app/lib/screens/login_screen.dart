import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import './register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
    });

    final success = await Provider.of<AuthProvider>(context, listen: false)
        .login(_emailController.text, _passwordController.text);

    if (!success && mounted) {
      final error = Provider.of<AuthProvider>(context, listen: false).error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Failed to login')),
      );
    }
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            if (_isLoading)
              const CircularProgressIndicator()
            else
              Column(
                children: [
                  ElevatedButton(
                    onPressed: _login,
                    child: const Text('Login'),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(MaterialPageRoute(
                        builder: (ctx) => const RegisterScreen(),
                      ));
                    },
                    child: const Text('Don\'t have an account? Register'),
                  ),
                ],
              )
          ],
        ),
      ),
    );
  }
}

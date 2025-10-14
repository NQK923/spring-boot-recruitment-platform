import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import './home_screen.dart';
import './login_screen.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    if (authProvider.isAuthenticated) {
      return const HomeScreen();
    } else {
      return const LoginScreen();
    }
  }
}

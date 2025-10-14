import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/auth_api_service.dart';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final _apiService = AuthApiService();
  String? _token;
  User? _user;
  String? _error;

  String? get token => _token;
  User? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _tryAutoLogin();
  }

  Future<void> _tryAutoLogin() async {
    final storedToken = await _storage.read(key: 'jwt');
    if (storedToken != null) {
      _token = storedToken;
      try {
        _user = await _apiService.getMe(_token!);
      } catch (e) {
        // Token might be expired, log out
        logout();
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    try {
      final token = await _apiService.login(email, password);
      _token = token;
      await _storage.write(key: 'jwt', value: _token);
      _user = await _apiService.getMe(_token!);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String email, String password) async {
    _error = null;
    try {
      await _apiService.register(email, password);
      // After successful registration, let the user login manually.
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await _storage.delete(key: 'jwt');
    notifyListeners();
  }
}

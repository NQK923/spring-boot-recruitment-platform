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
    if (storedToken != null && storedToken.isNotEmpty) {
      try {
        final user = await _apiService.getMe(storedToken);
        _token = storedToken;
        _user = user;
      } catch (e) {
        await _storage.delete(key: 'jwt');
        _token = null;
        _user = null;
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    try {
      final token = await _apiService.login(email, password);
      final user = await _apiService.getMe(token);

      _token = token;
      _user = user;
      await _storage.write(key: 'jwt', value: _token);

      notifyListeners();
      return true;
    } catch (e) {
      _error = _extractMessage(e);
      _token = null;
      _user = null;
      await _storage.delete(key: 'jwt');
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
      _error = _extractMessage(e);
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

  String _extractMessage(Object error) {
    final message = error.toString();
    const prefix = 'Exception: ';
    if (message.startsWith(prefix)) {
      return message.substring(prefix.length);
    }
    return message;
  }
}

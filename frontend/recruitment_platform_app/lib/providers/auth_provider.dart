import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../api/auth_api_service.dart';
import '../models/oauth_config.dart';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final _apiService = AuthApiService();
  OAuthConfig? _oauthConfig;
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
      } catch (_) {
        await _clearSession(notify: false);
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    try {
      final token = await _apiService.login(email, password);
      await _completeAuthentication(token);
      return true;
    } catch (e) {
      _error = _extractMessage(e);
      await _clearSession(notify: false);
      notifyListeners();
      return false;
    }
  }

  Future<bool> loginWithGoogle() async {
    _error = null;
    try {
      final config = await _loadOAuthConfig();
      final googleSignIn = GoogleSignIn(
        clientId: config.hasGoogleClientId ? config.googleClientId : null,
        scopes: const ['email', 'profile'],
      );

      final account = await googleSignIn.signIn();
      if (account == null) {
        _error = 'Google sign-in was cancelled';
        notifyListeners();
        return false;
      }

      final authentication = await account.authentication;
      final idToken = authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        _error = 'Google did not return an ID token';
        notifyListeners();
        return false;
      }

      final token = await _apiService.loginWithGoogle(idToken);
      await googleSignIn.signOut();
      await _completeAuthentication(token);
      return true;
    } catch (e) {
      _error = _extractMessage(e);
      await _clearSession(notify: false);
      notifyListeners();
      return false;
    }
  }

  Future<bool> loginWithGitHub() async {
    _error = null;
    try {
      final config = await _loadOAuthConfig();
      if (!config.hasGitHubClientId || !config.hasGitHubRedirect) {
        _error = 'GitHub login is not configured';
        notifyListeners();
        return false;
      }

      final redirectUri = Uri.parse(config.githubRedirectUri);
      final authorizeUrl = Uri.https('github.com', '/login/oauth/authorize', {
        'client_id': config.githubClientId,
        'scope': 'user:email',
        'redirect_uri': config.githubRedirectUri,
      });

      final result = await FlutterWebAuth2.authenticate(
        url: authorizeUrl.toString(),
        callbackUrlScheme: redirectUri.scheme,
      );

      final returnedUri = Uri.parse(result);
      final code = returnedUri.queryParameters['code'];
      if (code == null || code.isEmpty) {
        _error = 'GitHub login failed: missing authorization code';
        notifyListeners();
        return false;
      }

      final token = await _apiService.loginWithGitHub(code);
      await _completeAuthentication(token);
      return true;
    } on PlatformException catch (e) {
      if (e.code == 'CANCELED' || e.code == 'USER_CANCELED' || e.code == 'USER_CANCELLED') {
        _error = 'GitHub sign-in was cancelled';
      } else {
        _error = _extractMessage(e);
      }
      notifyListeners();
      return false;
    } catch (e) {
      _error = _extractMessage(e);
      await _clearSession(notify: false);
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String email, String password) async {
    _error = null;
    try {
      await _apiService.register(email, password);
      return true;
    } catch (e) {
      _error = _extractMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _error = null;
    await _clearSession();
  }

  Future<void> _completeAuthentication(String token) async {
    final user = await _apiService.getMe(token);
    _token = token;
    _user = user;
    _error = null;
    await _storage.write(key: 'jwt', value: _token);
    notifyListeners();
  }

  Future<OAuthConfig> _loadOAuthConfig() async {
    if (_oauthConfig != null) return _oauthConfig!;
    _oauthConfig = await _apiService.getOAuthConfig();
    return _oauthConfig!;
  }

  Future<void> _clearSession({bool notify = true}) async {
    _token = null;
    _user = null;
    await _storage.delete(key: 'jwt');
    if (notify) {
      notifyListeners();
    }
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

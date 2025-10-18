import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/oauth_config.dart';
import '../models/user.dart';
import '../utils/constants.dart';

class AuthApiService {
  Future<String> login(String email, String password) async {
    final url = Uri.parse('$BASE_URL/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email.trim(),
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      // Backend returns JwtAuthenticationResponse { "accessToken": "..." }
      final token = responseData['accessToken'] as String?;
      if (token == null || token.isEmpty) {
        throw Exception('Auth service did not return an access token');
      }
      return token;
    }

    String errorMessage = 'Failed to login';
    try {
      final responseData = json.decode(response.body);
      if (responseData is Map && responseData['message'] is String) {
        errorMessage = responseData['message'] as String;
      }
    } catch (_) {
      // Ignore parsing errors and fall back to default message.
    }
    throw Exception(errorMessage);
  }

  Future<void> register(String email, String password) async {
    final url = Uri.parse('$BASE_URL/auth/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email.trim(),
        'password': password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return;
    }

    String errorMessage = 'Failed to register';
    try {
      final responseData = json.decode(response.body);
      if (responseData is Map && responseData['message'] is String) {
        errorMessage = responseData['message'] as String;
      }
    } catch (_) {
      // Ignore parsing errors and fall back to default message.
    }
    throw Exception(errorMessage);
  }

  Future<String> loginWithGoogle(String idToken) async {
    final url = Uri.parse('$BASE_URL/auth/oauth/google');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'idToken': idToken}),
    );

    return _parseTokenResponse(response, defaultError: 'Failed to login with Google');
  }

  Future<String> loginWithGitHub(String code) async {
    final url = Uri.parse('$BASE_URL/auth/oauth/github');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'code': code}),
    );

    return _parseTokenResponse(response, defaultError: 'Failed to login with GitHub');
  }

  Future<OAuthConfig> getOAuthConfig() async {
    final url = Uri.parse('$BASE_URL/auth/oauth/config');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body) as Map<String, dynamic>;
      return OAuthConfig.fromJson(data);
    }

    throw Exception('Failed to load OAuth configuration');
  }

  Future<User> getMe(String token) async {
    final url = Uri.parse('$BASE_URL/auth/me');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return User.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to fetch user data');
    }
  }

  String _parseTokenResponse(http.Response response, {required String defaultError}) {
    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      if (responseData is Map<String, dynamic>) {
        final token = responseData['accessToken'] as String?;
        if (token != null && token.isNotEmpty) {
          return token;
        }
      }
      throw Exception('Auth service did not return an access token');
    }

    String errorMessage = defaultError;
    try {
      final responseData = json.decode(response.body);
      if (responseData is Map && responseData['message'] is String) {
        errorMessage = responseData['message'] as String;
      }
    } catch (_) {
      // Ignore parsing errors.
    }
    throw Exception(errorMessage);
  }
}

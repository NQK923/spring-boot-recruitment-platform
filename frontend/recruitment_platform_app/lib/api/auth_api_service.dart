import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../utils/constants.dart';

class AuthApiService {
  Future<String> login(String email, String password) async {
    final url = Uri.parse('$BASE_URL/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      // The backend sends { "token": "..." }, we need to extract the value.
      // My previous implementation was wrong, it should be responseData['jwt'] based on backend's JwtAuthenticationResponse
      return responseData['jwt']; 
    } else {
      // TODO: Handle different error status codes
      throw Exception('Failed to login');
    }
  }

  Future<void> register(String email, String password) async {
    final url = Uri.parse('$BASE_URL/auth/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 200) {
      // TODO: Handle different error status codes
      throw Exception('Failed to register');
    }
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
}

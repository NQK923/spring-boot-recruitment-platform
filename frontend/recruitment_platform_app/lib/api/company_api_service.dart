import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/company.dart';
import '../models/company_user.dart';
import '../utils/constants.dart';

class CompanyApiService {
  Map<String, String> _headers(String token) => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  Uri _resolve(String path) => Uri.parse('$BASE_URL$path');

  Future<Company> getMyCompany(String token) async {
    final url = _resolve('/companies/me');
    final response = await http.get(
      url,
      headers: _headers(token),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load company information');
    }

    return Company.fromJson(json.decode(response.body));
  }

  Future<List<CompanyUser>> getMyCompanyUsers(String token) async {
    final url = _resolve('/companies/me/users');
    final response = await http.get(
      url,
      headers: _headers(token),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load company members');
    }

    final List<dynamic> body = json.decode(response.body);
    return body.map((e) => CompanyUser.fromJson(e)).toList();
  }

  Future<void> inviteUserToCurrentCompany(
    String token, {
    required String email,
    required String role,
  }) async {
    final url = _resolve('/companies/me/users/invite');
    final response = await http.post(
      url,
      headers: _headers(token),
      body: json.encode({
        'email': email,
        'role': role,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to send invitation');
    }
  }

  Future<Company> updateMyCompany(
    String token, {
    required String name,
    String? description,
    String? website,
    String? logoUrl,
  }) async {
    final url = _resolve('/companies/me');
    final payload = <String, dynamic>{
      'name': name,
      'description': description,
      'website': website,
      'logoUrl': logoUrl,
    }..removeWhere((_, value) => value == null);

    if (payload.isEmpty) {
      throw Exception('No company changes provided');
    }

    final response = await http.put(
      url,
      headers: _headers(token),
      body: json.encode(payload),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update company profile');
    }

    return Company.fromJson(json.decode(response.body));
  }

  Future<List<CompanyUser>> getCompanyUsersForCompany(String token, int companyId) async {
    final url = _resolve('/companies/$companyId/users');
    final response = await http.get(
      url,
      headers: _headers(token),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load company members');
    }

    final List<dynamic> body = json.decode(response.body);
    return body.map((e) => CompanyUser.fromJson(e)).toList();
  }

  Future<void> inviteUserToCompany(
    String token,
    int companyId, {
    required String email,
    required String role,
  }) async {
    final url = _resolve('/companies/$companyId/users/invite');
    final response = await http.post(
      url,
      headers: _headers(token),
      body: json.encode({
        'email': email,
        'role': role,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to send invitation');
    }
  }

  Future<List<Company>> getAllCompanies(String token) async {
    final url = _resolve('/companies');
    final response = await http.get(
      url,
      headers: _headers(token),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load companies');
    }

    final List<dynamic> body = json.decode(response.body);
    return body.map((e) => Company.fromJson(e)).toList();
  }

  Future<Company> createCompany(
    String token, {
    required String name,
    String? description,
    String? website,
    String? logoUrl,
  }) async {
    final url = _resolve('/companies');
    final response = await http.post(
      url,
      headers: _headers(token),
      body: json.encode({
        'name': name,
        'description': description,
        'website': website,
        'logoUrl': logoUrl,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to create company');
    }

    return Company.fromJson(json.decode(response.body));
  }
}

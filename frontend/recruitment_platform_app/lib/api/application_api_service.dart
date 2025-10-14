import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/application.dart';
import '../utils/constants.dart';

class ApplicationApiService {
  Future<List<Application>> getMyApplications(String token) async {
    final url = Uri.parse('$BASE_URL/applications/my');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> applicationsJson = json.decode(response.body);
      return applicationsJson.map((json) => Application.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load applications');
    }
  }

  Future<void> applyForJob(String token, int jobPostingId, int cvId) async {
    final url = Uri.parse('$BASE_URL/applications');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'jobPostingId': jobPostingId,
        'cvId': cvId,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to apply for job');
    }
  }
}

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/application.dart';
import '../models/application_note.dart';
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

  Future<void> applyForJob(String token, int jobPostingId, int cvId, {String source = 'DIRECT'}) async {
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
        'source': source,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to apply for job');
    }
  }

  Future<void> updateApplicationStatus(String token, int applicationId, String newStatus) async {
    final url = Uri.parse('$BASE_URL/applications/$applicationId/status');
    final response = await http.patch(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'newStatus': newStatus,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update application status');
    }
  }

  Future<List<ApplicationNote>> getApplicationNotes(String token, int applicationId) async {
    final url = Uri.parse('$BASE_URL/applications/$applicationId/notes');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load application notes');
    }

    final List<dynamic> body = json.decode(response.body);
    return body.map((e) => ApplicationNote.fromJson(e)).toList();
  }

  Future<ApplicationNote> addApplicationNote(String token, int applicationId, String content) async {
    final url = Uri.parse('$BASE_URL/applications/$applicationId/notes');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'content': content}),
    );

    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to add note');
    }

    return ApplicationNote.fromJson(json.decode(response.body));
  }
}

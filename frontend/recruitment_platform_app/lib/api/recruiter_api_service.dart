import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/application.dart';
import '../models/create_job_request.dart';
import '../models/job.dart';
import '../models/profile.dart';
import '../utils/constants.dart';

class RecruiterApiService {
  Future<List<Job>> getCompanyJobs(String token) async {
    final url = Uri.parse('$BASE_URL/jobs');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> jobsJson = json.decode(response.body);
      return jobsJson.map((json) => Job.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load company jobs');
    }
  }

  Future<void> createJob(String token, CreateJobRequest jobRequest) async {
    final url = Uri.parse('$BASE_URL/jobs');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(jobRequest.toJson()),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to create job');
    }
  }

  Future<List<Application>> getApplicationsForJob(String token, int jobId) async {
    final url = Uri.parse('$BASE_URL/jobs/$jobId/applications');
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
      throw Exception('Failed to load applications for job');
    }
  }

  Future<Profile> getCandidateProfile(String token, int userId) async {
    final url = Uri.parse('$BASE_URL/profiles/$userId');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return Profile.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load candidate profile');
    }
  }
}

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/job.dart';
import '../utils/constants.dart';

class JobApiService {
  Future<List<Job>> getPublicJobs() async {
    final url = Uri.parse('$BASE_URL/jobs/public');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final List<dynamic> jobsJson = json.decode(response.body);
      return jobsJson.map((json) => Job.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load jobs');
    }
  }
}

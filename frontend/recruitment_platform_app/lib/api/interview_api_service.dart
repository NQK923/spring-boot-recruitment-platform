import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/schedule_interview_request.dart';
import '../utils/constants.dart';

class InterviewApiService {
  Future<void> scheduleInterview(String token, ScheduleInterviewRequest request) async {
    final url = Uri.parse('$BASE_URL/interviews');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(request.toJson()),
    );

    if (response.statusCode != 201) { // Created
      throw Exception('Failed to schedule interview');
    }
  }
}

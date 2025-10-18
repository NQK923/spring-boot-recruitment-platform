import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/interview.dart';
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

    if (response.statusCode != 201) {
      throw Exception('Failed to schedule interview');
    }
  }

  Future<List<Interview>> getMyInterviews(String token) async {
    final url = Uri.parse('$BASE_URL/interviews/my');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch interviews');
    }

    final List<dynamic> jsonBody = json.decode(response.body);
    return jsonBody.map((item) => Interview.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> rescheduleInterview(
    String token,
    int interviewId, {
    DateTime? scheduleTime,
    String? timezone,
    String? format,
    String? locationOrLink,
  }) async {
    final url = Uri.parse('$BASE_URL/interviews/$interviewId');

    final Map<String, dynamic> body = {};
    if (scheduleTime != null) {
      body['scheduleTime'] = scheduleTime.toIso8601String();
    }
    if (timezone != null) {
      body['timezone'] = timezone;
    }
    if (format != null) {
      body['format'] = format;
    }
    if (locationOrLink != null) {
      body['locationOrLink'] = locationOrLink;
    }

    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(body),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to reschedule interview');
    }
  }

  Future<void> submitFeedback(
    String token,
    int interviewId, {
    int? score,
    required String outcome,
    String? comments,
  }) async {
    final url = Uri.parse('$BASE_URL/interviews/$interviewId/feedback');
    final Map<String, dynamic> payload = {
      'outcome': outcome,
    };
    if (score != null) {
      payload['score'] = score;
    }
    if (comments != null && comments.isNotEmpty) {
      payload['comments'] = comments;
    }

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(payload),
    );

    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to submit feedback');
    }
  }
}

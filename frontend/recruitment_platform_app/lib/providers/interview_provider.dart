import 'package:flutter/material.dart';
import '../api/interview_api_service.dart';
import '../models/interview.dart';
import '../models/schedule_interview_request.dart';
import './auth_provider.dart';

class InterviewProvider with ChangeNotifier {
  AuthProvider _authProvider;
  final _apiService = InterviewApiService();

  List<Interview> _interviews = [];
  bool _isFetching = false;
  bool _isProcessing = false;
  String? _error;

  List<Interview> get interviews => _interviews;
  bool get isFetching => _isFetching;
  bool get isProcessing => _isProcessing;
  String? get error => _error;
  AuthProvider get authProvider => _authProvider;

  InterviewProvider(this._authProvider) {
    if (_authProvider.isAuthenticated) {
      fetchMyInterviews();
    }
  }

  void updateAuth(AuthProvider auth) {
    final wasAuthenticated = _authProvider.isAuthenticated;
    _authProvider = auth;

    if (!auth.isAuthenticated) {
      _interviews = [];
      _error = null;
      _isFetching = false;
      _isProcessing = false;
      notifyListeners();
      return;
    }

    if (!wasAuthenticated || _interviews.isEmpty) {
      fetchMyInterviews();
    }
  }

  Future<void> fetchMyInterviews({bool forceRefresh = false}) async {
    if (_authProvider.token == null) return;
    if (_isFetching && !forceRefresh) return;

    _isFetching = true;
    _error = null;
    notifyListeners();

    try {
      _interviews = await _apiService.getMyInterviews(_authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isFetching = false;
    notifyListeners();
  }

  Future<bool> scheduleInterview(ScheduleInterviewRequest request) async {
    if (!_authProvider.isAuthenticated) return false;

    _isProcessing = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.scheduleInterview(_authProvider.token!, request);
      _isProcessing = false;
      await fetchMyInterviews(forceRefresh: true);
      return true;
    } catch (e) {
      _error = e.toString();
      _isProcessing = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> rescheduleInterview(
    Interview interview,
    DateTime newSchedule, {
    String? timezone,
    String? format,
    String? locationOrLink,
  }) async {
    if (_authProvider.token == null) return false;

    _isProcessing = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.rescheduleInterview(
        _authProvider.token!,
        interview.id,
        scheduleTime: newSchedule,
        timezone: timezone ?? interview.timezone,
        format: format ?? interview.format,
        locationOrLink: locationOrLink ?? interview.locationOrLink,
      );
      _isProcessing = false;
      await fetchMyInterviews(forceRefresh: true);
      return true;
    } catch (e) {
      _error = e.toString();
      _isProcessing = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> submitFeedback({
    required int interviewId,
    int? score,
    required String outcome,
    String? comments,
  }) async {
    if (_authProvider.token == null) return false;

    _isProcessing = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.submitFeedback(
        _authProvider.token!,
        interviewId,
        score: score,
        outcome: outcome,
        comments: comments,
      );
      _isProcessing = false;
      await fetchMyInterviews(forceRefresh: true);
      return true;
    } catch (e) {
      _error = e.toString();
      _isProcessing = false;
      notifyListeners();
      return false;
    }
  }
}

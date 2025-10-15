import 'package:flutter/material.dart';
import '../api/interview_api_service.dart';
import '../models/schedule_interview_request.dart';
import './auth_provider.dart';

class InterviewProvider with ChangeNotifier {
  final AuthProvider authProvider;
  final _apiService = InterviewApiService();

  bool _isLoading = false;
  String? _error;

  bool get isLoading => _isLoading;
  String? get error => _error;

  InterviewProvider(this.authProvider);

  Future<bool> scheduleInterview(ScheduleInterviewRequest request) async {
    if (!authProvider.isAuthenticated) return false;
    
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.scheduleInterview(authProvider.token!, request);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}

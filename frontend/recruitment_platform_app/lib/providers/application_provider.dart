import 'package:flutter/material.dart';
import '../api/application_api_service.dart';
import '../models/application.dart';
import './auth_provider.dart';

class ApplicationProvider with ChangeNotifier {
  final AuthProvider authProvider;
  final _apiService = ApplicationApiService();

  List<Application> _applications = [];
  bool _isLoading = false;
  String? _error;

  List<Application> get applications => _applications;
  bool get isLoading => _isLoading;
  String? get error => _error;

  ApplicationProvider(this.authProvider) {
    if (authProvider.isAuthenticated) {
      fetchMyApplications();
    }
  }

  Future<void> fetchMyApplications() async {
    if (authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _applications = await _apiService.getMyApplications(authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> applyForJob(int jobPostingId, int cvId) async {
    if (authProvider.token == null) return false;
    _error = null;
    // No loading state for this action as it's a quick action

    try {
      await _apiService.applyForJob(authProvider.token!, jobPostingId, cvId);
      // Refresh the list of applications after applying
      await fetchMyApplications();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}

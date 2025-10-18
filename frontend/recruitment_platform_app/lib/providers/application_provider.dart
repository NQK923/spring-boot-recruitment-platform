import 'package:flutter/material.dart';
import '../api/application_api_service.dart';
import '../models/application.dart';
import './auth_provider.dart';

class ApplicationProvider with ChangeNotifier {
  AuthProvider _authProvider;
  final _apiService = ApplicationApiService();

  List<Application> _applications = [];
  bool _isLoading = false;
  String? _error;

  List<Application> get applications => _applications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  AuthProvider get authProvider => _authProvider;

  ApplicationProvider(this._authProvider) {
    if (_authProvider.isAuthenticated) {
      fetchMyApplications();
    }
  }

  void updateAuth(AuthProvider auth) {
    final wasAuthenticated = _authProvider.isAuthenticated;
    _authProvider = auth;

    if (!auth.isAuthenticated) {
      _applications = [];
      _error = null;
      _isLoading = false;
      notifyListeners();
      return;
    }

    if (!wasAuthenticated || _applications.isEmpty) {
      fetchMyApplications();
    }
  }

  Future<void> fetchMyApplications() async {
    if (_authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _applications = await _apiService.getMyApplications(_authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> applyForJob(int jobPostingId, int cvId, {String source = 'DIRECT'}) async {
    if (_authProvider.token == null) return false;
    _error = null;
    // No loading state for this action as it's a quick action

    try {
      await _apiService.applyForJob(_authProvider.token!, jobPostingId, cvId, source: source);
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

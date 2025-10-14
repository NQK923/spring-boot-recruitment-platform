import 'package:flutter/material.dart';
import '../api/job_api_service.dart';
import '../models/job.dart';

class JobProvider with ChangeNotifier {
  final _apiService = JobApiService();
  List<Job> _jobs = [];
  bool _isLoading = false;
  String? _error;

  List<Job> get jobs => _jobs;
  bool get isLoading => _isLoading;
  String? get error => _error;

  JobProvider() {
    fetchPublicJobs();
  }

  Future<void> fetchPublicJobs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _jobs = await _apiService.getPublicJobs();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}

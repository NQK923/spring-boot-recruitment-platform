import 'package:flutter/material.dart';
import '../api/application_api_service.dart';
import '../api/recruiter_api_service.dart';
import '../models/application.dart';
import '../models/create_job_request.dart';
import '../models/job.dart';
import '../models/profile.dart';
import './auth_provider.dart';

class RecruiterProvider with ChangeNotifier {
  final AuthProvider authProvider;
  final _recruiterApiService = RecruiterApiService();
  final _applicationApiService = ApplicationApiService();

  List<Job> _companyJobs = [];
  List<Application> _applicationsForJob = [];
  Profile? _viewingCandidateProfile;
  bool _isLoading = false;
  String? _error;

  List<Job> get companyJobs => _companyJobs;
  List<Application> get applicationsForJob => _applicationsForJob;
  Profile? get viewingCandidateProfile => _viewingCandidateProfile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  RecruiterProvider(this.authProvider) {
    if (authProvider.isAuthenticated && (authProvider.user?.hasRole('RECRUITER') ?? false)) {
      fetchCompanyJobs();
    }
  }

  Future<void> fetchCompanyJobs() async {
    if (authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _companyJobs = await _recruiterApiService.getCompanyJobs(authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchApplicationsForJob(int jobId) async {
    if (authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    _applicationsForJob = [];
    notifyListeners();

    try {
      _applicationsForJob = await _recruiterApiService.getApplicationsForJob(authProvider.token!, jobId);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchCandidateProfile(int userId) async {
    if (authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    _viewingCandidateProfile = null;
    notifyListeners();

    try {
      _viewingCandidateProfile = await _recruiterApiService.getCandidateProfile(authProvider.token!, userId);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateApplicationStatus(int applicationId, String newStatus) async {
    if (authProvider.token == null) return false;
    _error = null;

    try {
      await _applicationApiService.updateApplicationStatus(authProvider.token!, applicationId, newStatus);
      final currentJobId = _applicationsForJob.first.jobPostingId;
      await fetchApplicationsForJob(currentJobId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> createJob(CreateJobRequest jobRequest) async {
    if (authProvider.token == null) return false;
    _error = null;

    try {
      await _recruiterApiService.createJob(authProvider.token!, jobRequest);
      await fetchCompanyJobs(); // Refresh the job list
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}

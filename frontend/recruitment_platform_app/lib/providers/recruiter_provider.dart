import 'package:flutter/material.dart';
import '../api/application_api_service.dart';
import '../api/recruiter_api_service.dart';
import '../api/profile_api_service.dart';
import '../models/application.dart';
import '../models/application_note.dart';
import '../models/create_job_request.dart';
import '../models/job.dart';
import '../models/profile.dart';
import '../models/cv.dart';
import './auth_provider.dart';
import '../utils/file_saver.dart';

class RecruiterProvider with ChangeNotifier {
  AuthProvider _authProvider;
  final _recruiterApiService = RecruiterApiService();
  final _applicationApiService = ApplicationApiService();
  final _profileApiService = ProfileApiService();

  List<Job> _companyJobs = [];
  List<Application> _applicationsForJob = [];
  Profile? _viewingCandidateProfile;
  final Map<int, List<ApplicationNote>> _notesByApplication = {};
  bool _isLoading = false;
  bool _isNotesLoading = false;
  String? _error;
  String? _notesError;

  List<Job> get companyJobs => _companyJobs;
  List<Application> get applicationsForJob => _applicationsForJob;
  Profile? get viewingCandidateProfile => _viewingCandidateProfile;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isNotesLoading => _isNotesLoading;
  String? get notesError => _notesError;
  List<ApplicationNote> notesForApplication(int applicationId) =>
      _notesByApplication[applicationId] ?? [];
  AuthProvider get authProvider => _authProvider;

  RecruiterProvider(this._authProvider) {
    if (_authProvider.isAuthenticated && (_authProvider.user?.hasRole('RECRUITER') ?? false)) {
      fetchCompanyJobs();
    }
  }

  void updateAuth(AuthProvider auth) {
    final wasAuthenticated = _authProvider.isAuthenticated;
    final hadRecruiterRole = _authProvider.user?.hasRole('RECRUITER') ?? false;
    final hadCompanyAdminRole = _authProvider.user?.hasRole('COMPANY_ADMIN') ?? false;
    _authProvider = auth;

    if (!auth.isAuthenticated) {
      _companyJobs = [];
      _applicationsForJob = [];
      _viewingCandidateProfile = null;
      _notesByApplication.clear();
      _error = null;
      _notesError = null;
      _isLoading = false;
      _isNotesLoading = false;
      notifyListeners();
      return;
    }

    final hasRecruiterRole = auth.user?.hasRole('RECRUITER') ?? false;
    final hasCompanyAdminRole = auth.user?.hasRole('COMPANY_ADMIN') ?? false;
    if ((!wasAuthenticated && auth.isAuthenticated) ||
        (hasRecruiterRole && !hadRecruiterRole) ||
        (hasCompanyAdminRole && !hadCompanyAdminRole) ||
        _companyJobs.isEmpty) {
      fetchCompanyJobs();
    }
  }

  Future<void> fetchCompanyJobs() async {
    if (_authProvider.token == null) return;
    if (!(_authProvider.user?.hasRole('RECRUITER') ?? false) && !(_authProvider.user?.hasRole('COMPANY_ADMIN') ?? false)) {
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _companyJobs = await _recruiterApiService.getCompanyJobs(_authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchApplicationsForJob(int jobId) async {
    if (_authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    _applicationsForJob = [];
    notifyListeners();

    try {
      _applicationsForJob = await _recruiterApiService.getApplicationsForJob(_authProvider.token!, jobId);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchCandidateProfile(int userId) async {
    if (_authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    _viewingCandidateProfile = null;
    notifyListeners();

    try {
      _viewingCandidateProfile = await _recruiterApiService.getCandidateProfile(_authProvider.token!, userId);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateApplicationStatus(int applicationId, String newStatus) async {
    if (_authProvider.token == null) return false;
    _error = null;

    try {
      await _applicationApiService.updateApplicationStatus(_authProvider.token!, applicationId, newStatus);
      if (_applicationsForJob.isNotEmpty) {
        final currentJobId = _applicationsForJob.first.jobPostingId;
        await fetchApplicationsForJob(currentJobId);
      } else {
        await fetchCompanyJobs();
      }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> createJob(CreateJobRequest jobRequest) async {
    if (_authProvider.token == null) return false;
    _error = null;

    try {
      await _recruiterApiService.createJob(_authProvider.token!, jobRequest);
      await fetchCompanyJobs(); // Refresh the job list
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchNotesForApplication(int applicationId) async {
    if (_authProvider.token == null) return;
    _isNotesLoading = true;
    _notesError = null;
    notifyListeners();

    try {
      final notes = await _applicationApiService.getApplicationNotes(_authProvider.token!, applicationId);
      _notesByApplication[applicationId] = notes;
      _notesError = null;
    } catch (e) {
      _notesError = e.toString();
      _notesByApplication.remove(applicationId);
    }

    _isNotesLoading = false;
    notifyListeners();
  }

  Future<bool> addNoteToApplication(int applicationId, String content) async {
    if (_authProvider.token == null) return false;
    _notesError = null;
    try {
      final note = await _applicationApiService.addApplicationNote(_authProvider.token!, applicationId, content);
      final existing = _notesByApplication.putIfAbsent(applicationId, () => []);
      existing.insert(0, note);
      notifyListeners();
      return true;
    } catch (e) {
      _notesError = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<String> downloadCandidateCv(Cv cv) async {
    final token = _authProvider.token;
    if (token == null) {
      throw Exception('Authentication required to download CV.');
    }

    final fileId = cv.fileId;
    if (fileId == null || fileId.isEmpty) {
      throw Exception('This CV is not associated with a file.');
    }

    final download = await _profileApiService.downloadCvFile(token, fileId);
    return saveFile(
      fileName: download.fileName,
      bytes: download.bytes,
      contentType: download.contentType,
    );
  }
}

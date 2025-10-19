import 'package:flutter/material.dart';
import '../api/profile_api_service.dart';
import '../models/cv.dart';
import './auth_provider.dart';
import '../models/profile.dart';
import '../utils/file_saver.dart';

class ProfileProvider with ChangeNotifier {
  AuthProvider _authProvider;
  final _apiService = ProfileApiService();

  Profile? _profile;
  bool _isLoading = false;
  String? _error;

  Profile? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;
  AuthProvider get authProvider => _authProvider;

  ProfileProvider(this._authProvider) {
    if (_authProvider.isAuthenticated) {
      fetchMyProfile();
    }
  }

  void updateAuth(AuthProvider auth) {
    final wasAuthenticated = _authProvider.isAuthenticated;
    _authProvider = auth;

    if (!auth.isAuthenticated) {
      _profile = null;
      _error = null;
      _isLoading = false;
      notifyListeners();
      return;
    }

    if (!wasAuthenticated || _profile == null) {
      fetchMyProfile();
    }
  }

  Future<void> fetchMyProfile() async {
    if (_authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _profile = await _apiService.getMyProfile(_authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateMyProfile(Profile profile) async {
    if (_authProvider.token == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _profile = await _apiService.updateMyProfile(
        _authProvider.token!,
        profile,
      );
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

  Future<bool> uploadCv({
    required String versionName,
    String? filePath,
    List<int>? fileBytes,
    String? fileName,
    String? contentType,
  }) async {
    if (_authProvider.token == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.uploadCv(
        _authProvider.token!,
        versionName,
        filePath: filePath,
        fileBytes: fileBytes,
        fileName: fileName,
        contentType: contentType,
      );
      // After upload, refresh the profile to get the new CV list
      await fetchMyProfile();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> generateCv(String versionName) async {
    if (_authProvider.token == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.generateCv(_authProvider.token!, versionName);
      await fetchMyProfile();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<String> downloadCv(Cv cv) async {
    final token = _authProvider.token;
    if (token == null) {
      throw Exception('Authentication required to download CV.');
    }
    final fileId = cv.fileId;
    if (fileId == null) {
      throw Exception('This CV does not have an attached file.');
    }

    final downloaded = await _apiService.downloadCvFile(token, fileId);
    return saveFile(
      fileName: downloaded.fileName,
      bytes: downloaded.bytes,
      contentType: downloaded.contentType,
    );
  }
}

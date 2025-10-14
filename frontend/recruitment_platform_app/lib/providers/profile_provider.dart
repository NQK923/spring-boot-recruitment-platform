import 'package:flutter/material.dart';
import '../api/profile_api_service.dart';
import '../models/profile.dart';
import './auth_provider.dart';

class ProfileProvider with ChangeNotifier {
  final AuthProvider authProvider;
  final _apiService = ProfileApiService();

  Profile? _profile;
  bool _isLoading = false;
  String? _error;

  Profile? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  ProfileProvider(this.authProvider) {
    if (authProvider.isAuthenticated) {
      fetchMyProfile();
    }
  }

  Future<void> fetchMyProfile() async {
    if (authProvider.token == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _profile = await _apiService.getMyProfile(authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateMyProfile(Profile profile) async {
     if (authProvider.token == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _profile = await _apiService.updateMyProfile(authProvider.token!, profile);
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

  Future<bool> uploadCv(String versionName, String filePath) async {
    if (authProvider.token == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.uploadCv(authProvider.token!, versionName, filePath);
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
}

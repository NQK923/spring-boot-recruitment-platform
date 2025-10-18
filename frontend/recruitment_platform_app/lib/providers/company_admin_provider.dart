import 'package:flutter/material.dart';
import '../api/company_api_service.dart';
import '../models/company.dart';
import '../models/company_user.dart';
import './auth_provider.dart';

class CompanyAdminProvider with ChangeNotifier {
  AuthProvider _authProvider;
  final _apiService = CompanyApiService();

  Company? _company;
  List<CompanyUser> _members = [];
  bool _isLoading = false;
  bool _isInviting = false;
  String? _error;

  Company? get company => _company;
  List<CompanyUser> get members => _members;
  bool get isLoading => _isLoading;
  bool get isInviting => _isInviting;
  String? get error => _error;
  AuthProvider get authProvider => _authProvider;

  CompanyAdminProvider(this._authProvider) {
    if (_hasCompanyAccess) {
      refresh();
    }
  }

  bool get _hasCompanyAccess =>
      _authProvider.isAuthenticated && (_authProvider.user?.hasRole('COMPANY_ADMIN') ?? false);

  void updateAuth(AuthProvider auth) {
    final hadAccess = _hasCompanyAccess;
    _authProvider = auth;

    if (!_hasCompanyAccess) {
      _company = null;
      _members = [];
      _error = null;
      _isLoading = false;
      _isInviting = false;
      notifyListeners();
      return;
    }

    if (!hadAccess || _company == null) {
      refresh();
    }
  }

  Future<void> refresh() async {
    if (!_hasCompanyAccess || _authProvider.token == null) {
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _company = await _apiService.getMyCompany(_authProvider.token!);
      _members = await _apiService.getMyCompanyUsers(_authProvider.token!);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> inviteUser({required String email, required String role}) async {
    if (!_hasCompanyAccess || _authProvider.token == null) {
      return false;
    }

    _isInviting = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.inviteUserToCurrentCompany(
        _authProvider.token!,
        email: email,
        role: role,
      );
      _isInviting = false;
      await refresh();
      return true;
    } catch (e) {
      _error = e.toString();
      _isInviting = false;
      notifyListeners();
      return false;
    }
  }
}

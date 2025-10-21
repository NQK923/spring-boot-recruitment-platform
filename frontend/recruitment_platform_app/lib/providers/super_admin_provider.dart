import 'package:flutter/material.dart';

import '../api/company_api_service.dart';
import '../models/company.dart';
import '../models/company_user.dart';
import './auth_provider.dart';

class SuperAdminProvider with ChangeNotifier {
  AuthProvider _authProvider;
  final CompanyApiService _companyApi = CompanyApiService();

  List<Company> _companies = [];
  final Map<int, List<CompanyUser>> _companyMembers = {};
  final Set<int> _loadingMembers = {};
  final Map<int, String?> _membersErrors = {};
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _error;

  List<Company> get companies => _companies;
  List<CompanyUser> membersForCompany(int companyId) => _companyMembers[companyId] ?? [];
  bool isLoadingMembers(int companyId) => _loadingMembers.contains(companyId);
  String? membersError(int companyId) => _membersErrors[companyId];
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;
  AuthProvider get authProvider => _authProvider;

  bool get _hasSuperAdminAccess =>
      _authProvider.isAuthenticated && (_authProvider.user?.hasRole('SUPER_ADMIN') ?? false);

  SuperAdminProvider(this._authProvider) {
    if (_hasSuperAdminAccess) {
      fetchCompanies();
    }
  }

  void updateAuth(AuthProvider auth) {
    final hadAccess = _hasSuperAdminAccess;
    _authProvider = auth;

    if (!_hasSuperAdminAccess) {
      _companies = [];
      _companyMembers.clear();
      _membersErrors.clear();
      _loadingMembers.clear();
      _error = null;
      _isLoading = false;
      _isSubmitting = false;
      notifyListeners();
      return;
    }

    if (!hadAccess || _companies.isEmpty) {
      fetchCompanies();
    }
  }

  Future<void> fetchCompanies() async {
    if (!_hasSuperAdminAccess || _authProvider.token == null) {
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _companies = await _companyApi.getAllCompanies(_authProvider.token!);
      final validIds = _companies.map((c) => c.id).toSet();
      _companyMembers.removeWhere((key, value) => !validIds.contains(key));
      _membersErrors.removeWhere((key, value) => !validIds.contains(key));
      _loadingMembers.removeWhere((id) => !validIds.contains(id));
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadCompanyMembers(int companyId) async {
    if (!_hasSuperAdminAccess || _authProvider.token == null) {
      return;
    }

    if (_loadingMembers.contains(companyId)) {
      return;
    }

    _loadingMembers.add(companyId);
    _membersErrors.remove(companyId);
    notifyListeners();

    try {
      final members = await _companyApi.getCompanyUsersForCompany(_authProvider.token!, companyId);
      _companyMembers[companyId] = members;
    } catch (e) {
      _membersErrors[companyId] = e.toString();
      _companyMembers.remove(companyId);
    }

    _loadingMembers.remove(companyId);
    notifyListeners();
  }

  Future<bool> inviteCompanyUser({
    required int companyId,
    required String email,
    required String role,
  }) async {
    if (!_hasSuperAdminAccess || _authProvider.token == null) {
      return false;
    }

    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      await _companyApi.inviteUserToCompany(
        _authProvider.token!,
        companyId,
        email: email,
        role: role,
      );
      _isSubmitting = false;
      await loadCompanyMembers(companyId);
      return true;
    } catch (e) {
      _error = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> createCompany({
    required String name,
    String? description,
    String? website,
    String? logoUrl,
  }) async {
    if (!_hasSuperAdminAccess || _authProvider.token == null) {
      return false;
    }

    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      await _companyApi.createCompany(
        _authProvider.token!,
        name: name,
        description: description,
        website: website,
        logoUrl: logoUrl,
      );
      _isSubmitting = false;
      await fetchCompanies();
      return true;
    } catch (e) {
      _error = e.toString();
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadMembersForAllCompanies() async {
    if (!_hasSuperAdminAccess) {
      return;
    }
    for (final company in _companies) {
      await loadCompanyMembers(company.id);
    }
  }
}

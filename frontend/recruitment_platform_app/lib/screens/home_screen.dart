import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import './admin/super_admin_dashboard.dart';
import './candidate/candidate_dashboard.dart';
import './recruiter/recruiter_dashboard.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final bool isSuperAdmin = user.hasRole('SUPER_ADMIN');
    final bool isRecruiter = user.hasRole('RECRUITER') || user.hasRole('COMPANY_ADMIN');
    final bool isCandidate = user.hasRole('CANDIDATE');

    Widget dashboard;
    if (isSuperAdmin) {
      dashboard = const SuperAdminDashboard();
    } else if (isRecruiter) {
      dashboard = const RecruiterDashboard();
    } else if (isCandidate) {
      dashboard = const CandidateDashboard();
    } else {
      dashboard = Scaffold(
        backgroundColor: Theme.of(context).colorScheme.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.help_outline, size: 48, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              Text(
                'No dashboard available for your role',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: authProvider.logout,
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Log out'),
              ),
            ],
          ),
        ),
      );
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: dashboard,
    );
  }
}

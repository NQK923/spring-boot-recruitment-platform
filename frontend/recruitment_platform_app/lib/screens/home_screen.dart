import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import './candidate/candidate_dashboard.dart';
import './recruiter/recruiter_dashboard.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    // Default to a loading or empty screen if user data is not yet available
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Loading...')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    // A simple way to dispatch based on role. 
    // A more robust app might use a dedicated role management system.
    bool isRecruiter = user.hasRole('RECRUITER') || user.hasRole('COMPANY_ADMIN');
    bool isCandidate = user.hasRole('CANDIDATE');

    Widget dashboard;
    if (isRecruiter) {
      dashboard = const RecruiterDashboard();
    } else if (isCandidate) {
      dashboard = const CandidateDashboard();
    } else {
      // Fallback for users with no specific role dashboard (e.g., SUPER_ADMIN)
      dashboard = Scaffold(
        appBar: AppBar(title: const Text('Admin Panel')),
        body: const Center(child: Text('Welcome, Admin!')),
      );
    }

    return Scaffold(
      body: dashboard,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Provider.of<AuthProvider>(context, listen: false).logout();
        },
        tooltip: 'Logout',
        child: const Icon(Icons.logout),
      ),
    );
  }
}

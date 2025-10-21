import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/application_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/interview_provider.dart';
import '../../providers/job_provider.dart';
import '../../widgets/layout/dashboard_shell.dart';
import './job_list_screen.dart';
import './my_applications_screen.dart';
import './my_interviews_screen.dart';
import './profile_screen.dart';

class CandidateDashboard extends StatelessWidget {
  const CandidateDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final tabs = [
      DashboardTab(
        id: 'jobs',
        icon: Icons.work_outline,
        label: 'Jobs',
        title: 'Discover tailored opportunities',
        subtitle: 'Browse curated roles from employers that match your interests.',
        badge: Consumer<JobProvider>(
          builder: (_, jobProvider, __) {
            final total = jobProvider.jobs.length;
            return Chip(
              avatar: const Icon(Icons.business_center_outlined, size: 16),
              label: Text('$total openings'),
            );
          },
        ),
        actions: [
          Consumer<JobProvider>(
            builder: (_, jobProvider, __) => OutlinedButton.icon(
              onPressed: jobProvider.isLoading ? null : jobProvider.fetchPublicJobs,
              icon: jobProvider.isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh_rounded),
              label: const Text('Refresh jobs'),
            ),
          ),
        ],
        child: const JobListScreen(),
      ),
      DashboardTab(
        id: 'applications',
        icon: Icons.fact_check_outlined,
        label: 'Applications',
        title: 'Track your progress',
        subtitle:
            'Monitor every role you have applied for and stay informed about status updates.',
        badge: Consumer<ApplicationProvider>(
          builder: (_, applicationProvider, __) {
            final count = applicationProvider.applications.length;
            return Chip(
              avatar: const Icon(Icons.timeline_rounded, size: 16),
              label: Text('$count applications'),
            );
          },
        ),
        child: const MyApplicationsScreen(),
      ),
      DashboardTab(
        id: 'interviews',
        icon: Icons.calendar_month_outlined,
        label: 'Interviews',
        title: 'Prepare for upcoming conversations',
        subtitle: 'View interview logistics, participants, and outcomes in one place.',
        badge: Consumer<InterviewProvider>(
          builder: (_, interviewProvider, __) {
            final upcoming = interviewProvider.interviews
                .where((interview) => interview.scheduleTime.isAfter(DateTime.now()))
                .length;
            return Chip(
              avatar: const Icon(Icons.schedule_rounded, size: 16),
              label: Text('$upcoming upcoming'),
            );
          },
        ),
        child: const MyInterviewsScreen(),
      ),
      DashboardTab(
        id: 'profile',
        icon: Icons.person_outline,
        label: 'Profile',
        title: 'Showcase your story',
        subtitle:
            'Keep your career summary, experience, and CV versions polished for recruiter reviews.',
        child: const ProfileScreen(),
      ),
    ];

    return DashboardShell(
      tabs: tabs,
      onLogout: authProvider.logout,
    );
  }
}

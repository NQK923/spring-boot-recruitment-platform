import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/application_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/interview_provider.dart';
import '../../providers/recruiter_provider.dart';
import '../../widgets/layout/dashboard_shell.dart';
import './company_admin_screen.dart';
import './job_postings_screen.dart';
import './recruiter_interviews_screen.dart';

class RecruiterDashboard extends StatelessWidget {
  const RecruiterDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isCompanyAdmin = authProvider.user?.hasRole('COMPANY_ADMIN') ?? false;

    final tabs = <DashboardTab>[
      DashboardTab(
        id: 'jobs',
        icon: Icons.work_outline,
        label: 'Job postings',
        title: 'Manage openings',
        subtitle: 'Oversee live roles and monitor pipeline health for each position.',
        badge: Consumer<RecruiterProvider>(
          builder: (_, provider, __) {
            final total = provider.companyJobs.length;
            return Chip(
              avatar: const Icon(Icons.list_alt_outlined, size: 16),
              label: Text('$total postings'),
            );
          },
        ),
        actions: [
          Consumer<RecruiterProvider>(
            builder: (_, provider, __) => OutlinedButton.icon(
              onPressed: provider.isLoading ? null : provider.fetchCompanyJobs,
              icon: provider.isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh_rounded),
              label: const Text('Sync jobs'),
            ),
          ),
        ],
        child: const JobPostingsScreen(),
      ),
      DashboardTab(
        id: 'interviews',
        icon: Icons.calendar_month_outlined,
        label: 'Interviews',
        title: 'Coordinate interviews',
        subtitle:
            'Keep interviewers aligned, reschedule on the fly, and capture feedback when conversations end.',
        badge: Consumer<InterviewProvider>(
          builder: (_, provider, __) {
            final upcoming = provider.interviews
                .where((interview) => interview.scheduleTime.isAfter(DateTime.now()))
                .length;
            return Chip(
              avatar: const Icon(Icons.schedule_rounded, size: 16),
              label: Text('$upcoming upcoming'),
            );
          },
        ),
        child: const RecruiterInterviewsScreen(),
      ),
      DashboardTab(
        id: 'company',
        icon: isCompanyAdmin ? Icons.apartment_outlined : Icons.people_outline,
        label: isCompanyAdmin ? 'Company' : 'Team',
        title: isCompanyAdmin ? 'Company administration' : 'Hiring team',
        subtitle: isCompanyAdmin
            ? 'Configure company information, design invitations, and manage access.'
            : 'Collaborate with your teammates to progress applicants quickly.',
        badge: Consumer<ApplicationProvider>(
          builder: (_, applications, __) => Chip(
            avatar: const Icon(Icons.timeline_outlined, size: 16),
            label: Text('${applications.applications.length} active apps'),
          ),
        ),
        child: isCompanyAdmin
            ? const CompanyAdminScreen()
            : const _ComingSoonPlaceholder(),
      ),
    ];

    return DashboardShell(
      tabs: tabs,
      onLogout: authProvider.logout,
    );
  }
}

class _ComingSoonPlaceholder extends StatelessWidget {
  const _ComingSoonPlaceholder();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.upcoming_outlined, size: 48, color: theme.colorScheme.primary),
          const SizedBox(height: 16),
          Text(
            'Team analytics are coming soon',
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text(
            'Track interviewer load, response rates, and hiring velocity in the next release.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}

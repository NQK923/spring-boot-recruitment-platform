import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/application.dart';
import '../../providers/application_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';

class MyApplicationsScreen extends StatelessWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
      ),
      body: Consumer<ApplicationProvider>(
        builder: (context, appProvider, child) {
          if (appProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (appProvider.error != null) {
            return EmptyState(
              icon: Icons.error_outline,
              title: 'We couldn’t load your applications',
              subtitle: appProvider.error!,
              action: OutlinedButton.icon(
                onPressed: appProvider.fetchMyApplications,
                icon: const Icon(Icons.refresh),
                label: const Text('Try again'),
              ),
            );
          }

          if (appProvider.applications.isEmpty) {
            return EmptyState(
              icon: Icons.file_present_outlined,
              title: 'No applications yet',
              subtitle: 'Start exploring roles that match your interests and apply directly here.',
            );
          }

          return RefreshIndicator(
            displacement: 30,
            onRefresh: appProvider.fetchMyApplications,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              children: [
                SectionHeader(
                  title: 'Application timeline',
                  subtitle: 'Track the status of roles you have applied for recently.',
                  trailing: Chip(
                    label: Text('${appProvider.applications.length} total'),
                  ),
                ),
                const SizedBox(height: 12),
                ...appProvider.applications
                    .map((application) => _ApplicationCard(application: application, theme: theme))
                    .toList(),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  const _ApplicationCard({
    required this.application,
    required this.theme,
  });

  final Application application;
  final ThemeData theme;

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'hired':
      case 'approved':
        return const Color(0xFF16A34A);
      case 'rejected':
      case 'declined':
        return const Color(0xFFDC2626);
      case 'interview_scheduled':
        return const Color(0xFF7C3AED);
      default:
        return theme.colorScheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat.yMMMd().format(application.appliedAt.toLocal());
    final statusColor = _statusColor(application.status);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 16,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: theme.colorScheme.primary.withOpacity(0.12),
                    ),
                    child: Icon(
                      Icons.description_outlined,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Job #${application.jobPostingId}',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.calendar_month_outlined,
                                size: 16, color: theme.textTheme.bodySmall?.color),
                            const SizedBox(width: 6),
                            Text(
                              'Applied $formattedDate',
                              style: theme.textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Chip(
                    backgroundColor: statusColor.withOpacity(0.12),
                    label: Text(
                      application.status.replaceAll('_', ' ').toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: theme.colorScheme.primary, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'We will notify you as soon as the hiring team takes the next action.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/application.dart';
import '../../providers/application_provider.dart';
import '../../widgets/empty_state.dart';

class MyApplicationsScreen extends StatelessWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<ApplicationProvider>(
      builder: (context, appProvider, _) {
        if (appProvider.isLoading && appProvider.applications.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (appProvider.error != null && appProvider.applications.isEmpty) {
          return Center(
            child: EmptyState(
              icon: Icons.error_outline,
              title: 'Unable to load your applications',
              subtitle: appProvider.error!,
              action: OutlinedButton.icon(
                onPressed: appProvider.fetchMyApplications,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ),
          );
        }

        if (appProvider.applications.isEmpty) {
          return Center(
            child: EmptyState(
              icon: Icons.file_present_outlined,
              title: 'No applications yet',
              subtitle:
                  'Start exploring roles that match your interests and apply directly from the job discovery tab.',
            ),
          );
        }

        final applications = appProvider.applications;
        final groupedByStatus = _groupByStatus(applications);

        return RefreshIndicator(
          displacement: 40,
          onRefresh: appProvider.fetchMyApplications,
          child: Scrollbar(
            interactive: true,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 12),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate(
                      [
                        _StatusSummary(groupedByStatus: groupedByStatus, theme: theme),
                        const SizedBox(height: 24),
                        Text(
                          'Latest updates',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Track the progress of every opportunity you have submitted.',
                          style: theme.textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _ApplicationCard(
                        application: applications[index],
                        theme: theme,
                      ),
                      childCount: applications.length,
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 48)),
              ],
            ),
          ),
        );
      },
    );
  }

  Map<String, int> _groupByStatus(List<Application> applications) {
    final Map<String, int> counts = {};
    for (final application in applications) {
      final key = application.status.toUpperCase();
      counts.update(key, (value) => value + 1, ifAbsent: () => 1);
    }
    return counts;
  }
}

class _StatusSummary extends StatelessWidget {
  const _StatusSummary({required this.groupedByStatus, required this.theme});

  final Map<String, int> groupedByStatus;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final total = groupedByStatus.values.fold<int>(0, (sum, count) => sum + count);
    final awaitingReview = groupedByStatus.entries
        .where((entry) => entry.key.contains('REVIEW') || entry.key.contains('SUBMITTED'))
        .fold<int>(0, (value, entry) => value + entry.value);
    final interviewing = groupedByStatus.entries
        .where((entry) => entry.key.contains('INTERVIEW') || entry.key.contains('SCREENING'))
        .fold<int>(0, (value, entry) => value + entry.value);
    final offers = groupedByStatus.entries
        .where((entry) => entry.key.contains('OFFER') || entry.key.contains('ACCEPTED'))
        .fold<int>(0, (value, entry) => value + entry.value);

    Widget buildCard({required String label, required int count, required Color color, String? hint}) {
      return Container(
        width: 220,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$count',
              style: theme.textTheme.headlineSmall?.copyWith(
                color: color,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            if (hint != null) ...[
              const SizedBox(height: 4),
              Text(
                hint,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.8),
                ),
              ),
            ],
          ],
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 900;
        return Wrap(
          spacing: 16,
          runSpacing: 12,
          children: [
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildCard(
                label: 'Total applications',
                count: total,
                color: theme.colorScheme.primary,
                hint: 'Keep your profile updated for higher response rates.',
              ),
            ),
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildCard(
                label: 'Awaiting review',
                count: awaitingReview,
                color: const Color(0xFF6366F1),
                hint: 'Hiring teams typically review within 3 business days.',
              ),
            ),
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildCard(
                label: 'Interviews scheduled',
                count: interviewing,
                color: const Color(0xFF10B981),
                hint: 'Prepare and confirm your availability.',
              ),
            ),
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildCard(
                label: 'Offers',
                count: offers,
                color: const Color(0xFFF97316),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  const _ApplicationCard({required this.application, required this.theme});

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
      case 'screening':
      case 'interview':
        return const Color(0xFF7C3AED);
      case 'offer_sent':
        return const Color(0xFFF59E0B);
      default:
        return theme.colorScheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat.yMMMd().format(application.appliedAt.toLocal());
    final statusColor = _statusColor(application.status);
    final statusLabel = application.status.replaceAll('_', ' ').toUpperCase();

    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 48,
                    width: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: theme.colorScheme.primary.withOpacity(0.12),
                    ),
                    child: Icon(
                      Icons.description_outlined,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Application #${application.id}',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Job #${application.jobPostingId}',
                          style: theme.textTheme.bodySmall,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Icon(
                              Icons.calendar_month_outlined,
                              size: 16,
                              color: theme.textTheme.bodySmall?.color,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Applied on $formattedDate',
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
                      statusLabel,
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.7,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.timeline_rounded, color: theme.colorScheme.primary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pipeline activity',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'We will notify you as soon as the hiring team moves you to the next stage.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
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

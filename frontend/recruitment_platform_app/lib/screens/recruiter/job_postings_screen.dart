import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/job.dart';
import '../../providers/recruiter_provider.dart';
import './candidate_list_screen.dart';
import './create_job_screen.dart';

class JobPostingsScreen extends StatelessWidget {
  const JobPostingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<RecruiterProvider>(
      builder: (context, recruiterProvider, _) {
        if (recruiterProvider.isLoading && recruiterProvider.companyJobs.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (recruiterProvider.error != null && recruiterProvider.companyJobs.isEmpty) {
          return _JobEmptyState(
            icon: Icons.warning_amber_outlined,
            title: 'Unable to load job postings',
            subtitle: recruiterProvider.error!,
            action: OutlinedButton.icon(
              onPressed: recruiterProvider.fetchCompanyJobs,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
          );
        }

        if (recruiterProvider.companyJobs.isEmpty) {
          return _JobEmptyState(
            icon: Icons.work_outline,
            title: 'No active postings yet',
            subtitle: 'Get started by publishing a job to invite candidates into your pipeline.',
            action: FilledButton.icon(
              onPressed: () => _openCreateJob(context),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Create job'),
            ),
          );
        }

        final totalJobs = recruiterProvider.companyJobs.length;
        final openJobs = recruiterProvider.companyJobs
            .where((job) => job.status.toUpperCase() == 'OPEN')
            .length;
        final closedJobs = recruiterProvider.companyJobs
            .where((job) => job.status.toUpperCase() == 'CLOSED')
            .length;

        return RefreshIndicator(
          displacement: 40,
          onRefresh: recruiterProvider.fetchCompanyJobs,
          child: Scrollbar(
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate(
                      [
                        _SummaryHeader(
                          totalJobs: totalJobs,
                          openJobs: openJobs,
                          closedJobs: closedJobs,
                          onCreateJob: () => _openCreateJob(context),
                          isLoading: recruiterProvider.isLoading,
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
                      (context, index) {
                        final job = recruiterProvider.companyJobs[index];
                        return _JobCard(
                          job: job,
                          onTap: () => Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (ctx) => CandidateListScreen(
                                jobId: job.id,
                                jobTitle: job.title,
                              ),
                            ),
                          ),
                        );
                      },
                      childCount: recruiterProvider.companyJobs.length,
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

  void _openCreateJob(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CreateJobScreen()),
    );
  }
}

class _SummaryHeader extends StatelessWidget {
  const _SummaryHeader({
    required this.totalJobs,
    required this.openJobs,
    required this.closedJobs,
    required this.onCreateJob,
    required this.isLoading,
  });

  final int totalJobs;
  final int openJobs;
  final int closedJobs;
  final VoidCallback onCreateJob;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    Widget buildCard({
      required IconData icon,
      required String label,
      required int count,
      Color? color,
    }) {
      final tileColor = (color ?? theme.colorScheme.primary).withOpacity(0.08);
      return Container(
        width: 220,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
        decoration: BoxDecoration(
          color: tileColor,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Icon(icon, color: color ?? theme.colorScheme.primary),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$count',
                  style: textTheme.headlineSmall?.copyWith(
                    color: color ?? theme.colorScheme.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Manage open roles',
                    style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Monitor live postings, check pipeline health, and keep candidates engaged with timely actions.',
                    style: textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            FilledButton.icon(
              onPressed: isLoading ? null : onCreateJob,
              icon: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.add_rounded),
              label: const Text('Create job'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth > 900;
            final width = isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth;
            return Wrap(
              spacing: 16,
              runSpacing: 12,
              children: [
                SizedBox(
                  width: width,
                  child: buildCard(
                    icon: Icons.work_outline_rounded,
                    label: 'Total postings',
                    count: totalJobs,
                  ),
                ),
                SizedBox(
                  width: width,
                  child: buildCard(
                    icon: Icons.lightbulb_outline,
                    label: 'Currently open',
                    count: openJobs,
                    color: const Color(0xFF10B981),
                  ),
                ),
                SizedBox(
                  width: width,
                  child: buildCard(
                    icon: Icons.source_outlined,
                    label: 'Closed or on hold',
                    count: closedJobs,
                    color: const Color(0xFFF97316),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job, required this.onTap});

  final Job job;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = job.status.toString().toUpperCase();

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Ink(
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
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 46,
                      width: 46,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: theme.colorScheme.primary.withOpacity(0.14),
                      ),
                      child: Icon(Icons.cases_outlined, color: theme.colorScheme.primary),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Job #${job.id}',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    JobStatusBadge(status: status),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  job.description,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(Icons.groups_rounded, color: theme.colorScheme.primary.withOpacity(0.9)),
                    const SizedBox(width: 8),
                    Text(
                      'Tap to see applicants',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary.withOpacity(0.9),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}

class JobStatusBadge extends StatelessWidget {
  const JobStatusBadge({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final normalized = status.toUpperCase();
    final color = _statusColor(normalized);
    final label = _formatStatus(normalized);
    return Chip(
      backgroundColor: color.withOpacity(0.12),
      label: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
        ),
      ),
    );
  }

  static String _formatStatus(String normalized) {
    if (normalized.isEmpty) return 'Unknown';
    final lower = normalized.toLowerCase();
    return '${lower[0].toUpperCase()}${lower.substring(1)}';
  }

  static Color _statusColor(String normalized) {
    switch (normalized) {
      case 'OPEN':
        return const Color(0xFF16A34A);
      case 'PAUSED':
        return const Color(0xFFF97316);
      case 'CLOSED':
        return const Color(0xFFDC2626);
      case 'DRAFT':
        return const Color(0xFF3B82F6);
      default:
        return const Color(0xFF475569);
    }
  }
}

class _JobEmptyState extends StatelessWidget {
  const _JobEmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.action,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Widget action;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 84,
              width: 84,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: theme.colorScheme.primary.withOpacity(0.12),
              ),
              child: Icon(icon, size: 40, color: theme.colorScheme.primary),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodySmall?.color,
              ),
            ),
            const SizedBox(height: 24),
            action,
          ],
        ),
      ),
    );
  }
}

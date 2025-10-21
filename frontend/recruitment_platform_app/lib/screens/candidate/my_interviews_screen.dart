import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/interview.dart';
import '../../providers/interview_provider.dart';
import '../../widgets/empty_state.dart';

class MyInterviewsScreen extends StatefulWidget {
  const MyInterviewsScreen({super.key});

  @override
  State<MyInterviewsScreen> createState() => _MyInterviewsScreenState();
}

class _MyInterviewsScreenState extends State<MyInterviewsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<InterviewProvider>(context, listen: false).fetchMyInterviews();
      }
    });
  }

  Future<void> _reschedule(BuildContext context, Interview interview) async {
    final currentDate = interview.scheduleTime.toLocal();

    final pickedDate = await showDatePicker(
      context: context,
      initialDate: currentDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (pickedDate == null) return;

    final pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(currentDate),
    );
    if (pickedTime == null) return;

    final newDateTime = DateTime(
      pickedDate.year,
      pickedDate.month,
      pickedDate.day,
      pickedTime.hour,
      pickedTime.minute,
    );

    final provider = Provider.of<InterviewProvider>(context, listen: false);
    final success = await provider.rescheduleInterview(
      interview,
      newDateTime.toUtc(),
      timezone: interview.timezone ?? 'UTC',
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Interview rescheduled' : provider.error ?? 'Unable to reschedule'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<InterviewProvider>(
      builder: (context, provider, _) {
        if (provider.isFetching && provider.interviews.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && provider.interviews.isEmpty) {
          return Center(
            child: EmptyState(
              icon: Icons.error_outline,
              title: 'No interviews scheduled',
              subtitle: provider.error!,
              action: OutlinedButton.icon(
                onPressed: provider.fetchMyInterviews,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ),
          );
        }

        if (provider.interviews.isEmpty) {
          return const Center(
            child: EmptyState(
              icon: Icons.calendar_today_outlined,
              title: 'You have no interviews yet',
              subtitle: 'When interviews are scheduled, you will see them appear here with full details.',
            ),
          );
        }

        final interviews = provider.interviews;
        final summary = _InterviewSummary.fromInterviews(interviews);

        return RefreshIndicator(
          displacement: 40,
          onRefresh: () => provider.fetchMyInterviews(forceRefresh: true),
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
                        _SummaryCards(summary: summary),
                        const SizedBox(height: 24),
                        Text(
                          'Upcoming conversations',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Get ready for each conversation and feel confident about the next steps.',
                          style: Theme.of(context).textTheme.bodyMedium,
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
                        final interview = interviews[index];
                        return _InterviewCard(
                          interview: interview,
                          isBusy: provider.isProcessing,
                          onReschedule: () => _reschedule(context, interview),
                        );
                      },
                      childCount: interviews.length,
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
}

class _InterviewSummary {
  const _InterviewSummary({
    required this.total,
    required this.upcoming,
    required this.awaitingFeedback,
    required this.completed,
  });

  final int total;
  final int upcoming;
  final int awaitingFeedback;
  final int completed;

  factory _InterviewSummary.fromInterviews(List<Interview> interviews) {
    final now = DateTime.now();
    int upcoming = 0;
    int awaitingFeedback = 0;
    int completed = 0;

    for (final interview in interviews) {
      if (interview.scheduleTime.isAfter(now)) {
        upcoming++;
      } else if ((interview.outcome ?? '').isEmpty) {
        awaitingFeedback++;
      } else {
        completed++;
      }
    }
    return _InterviewSummary(
      total: interviews.length,
      upcoming: upcoming,
      awaitingFeedback: awaitingFeedback,
      completed: completed,
    );
  }
}

class _SummaryCards extends StatelessWidget {
  const _SummaryCards({required this.summary});

  final _InterviewSummary summary;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget buildCard({
      required IconData icon,
      required String label,
      required int count,
      required Color color,
      String? helper,
    }) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 14),
            Expanded(
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
                    style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  if (helper != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      helper,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.textTheme.bodySmall?.color?.withOpacity(0.8),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    return LayoutBuilder(
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
                icon: Icons.handshake_outlined,
                label: 'Upcoming interviews',
                count: summary.upcoming,
                color: theme.colorScheme.primary,
                helper: 'Confirm availability at least 24 hours in advance.',
              ),
            ),
            SizedBox(
              width: width,
              child: buildCard(
                icon: Icons.local_fire_department_outlined,
                label: 'Awaiting feedback',
                count: summary.awaitingFeedback,
                color: const Color(0xFFFB923C),
                helper: 'Recruiters will share feedback as soon as it is logged.',
              ),
            ),
            SizedBox(
              width: width,
              child: buildCard(
                icon: Icons.emoji_events_outlined,
                label: 'Completed conversations',
                count: summary.completed,
                color: const Color(0xFF10B981),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _InterviewCard extends StatelessWidget {
  const _InterviewCard({
    required this.interview,
    required this.isBusy,
    required this.onReschedule,
  });

  final Interview interview;
  final bool isBusy;
  final VoidCallback onReschedule;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheduleLocal = interview.scheduleTime.toLocal();
    final dateLabel = DateFormat.yMMMMEEEEd().format(scheduleLocal);
    final timeLabel = DateFormat.jm().format(scheduleLocal);
    final timezone = interview.timezone ?? 'UTC';
    final interviewerIds =
        interview.participants.where((p) => p.role.toLowerCase() == 'interviewer').map((p) => '#${p.userId}').join(', ');
    final outcome = interview.outcome;

    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 18,
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
                    child: Icon(Icons.calendar_month, color: theme.colorScheme.primary),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Application #${interview.applicationId}',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '$dateLabel • $timeLabel ($timezone)',
                          style: theme.textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  if (outcome != null && outcome.isNotEmpty)
                    Chip(
                      backgroundColor: const Color(0xFF10B981).withOpacity(0.12),
                      label: Text(
                        outcome.toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFF0F766E),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 20),
              if (interviewerIds.isNotEmpty) ...[
                _InfoRow(
                  icon: Icons.people_outline,
                  label: 'Interviewers',
                  value: interviewerIds,
                ),
                const SizedBox(height: 12),
              ],
              if ((interview.format ?? '').isNotEmpty) ...[
                _InfoRow(
                  icon: Icons.video_camera_front_outlined,
                  label: 'Format',
                  value: interview.format!,
                ),
                const SizedBox(height: 12),
              ],
              if ((interview.locationOrLink ?? '').isNotEmpty) ...[
                _InfoRow(
                  icon: Icons.place_outlined,
                  label: 'Location / link',
                  value: interview.locationOrLink!,
                ),
                const SizedBox(height: 12),
              ],
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.lightbulb_outline, color: theme.colorScheme.primary),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Arrive 5 minutes early and double-check your connection or location details.',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Align(
                alignment: Alignment.centerRight,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.edit_calendar_outlined),
                  label: const Text('Request reschedule'),
                  onPressed: isBusy ? null : onReschedule,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: theme.textTheme.bodySmall?.color),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

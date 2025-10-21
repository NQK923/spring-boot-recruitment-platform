import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/interview.dart';
import '../../providers/interview_provider.dart';

class RecruiterInterviewsScreen extends StatefulWidget {
  const RecruiterInterviewsScreen({super.key});

  @override
  State<RecruiterInterviewsScreen> createState() => _RecruiterInterviewsScreenState();
}

class _RecruiterInterviewsScreenState extends State<RecruiterInterviewsScreen> {
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
      format: interview.format,
      locationOrLink: interview.locationOrLink,
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Interview rescheduled' : provider.error ?? 'Failed to reschedule'),
      ),
    );
  }

  Future<void> _showFeedbackDialog(BuildContext context, Interview interview) async {
    final scoreController = TextEditingController();
    final commentsController = TextEditingController();
    String outcome = 'PASS';

    final submitted = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Submit feedback'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: scoreController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Score (optional)'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: outcome,
                decoration: const InputDecoration(labelText: 'Outcome'),
                items: const [
                  DropdownMenuItem(value: 'PASS', child: Text('Pass')),
                  DropdownMenuItem(value: 'FAIL', child: Text('Fail')),
                  DropdownMenuItem(value: 'HOLD', child: Text('Hold')),
                ],
                onChanged: (value) {
                  if (value != null) outcome = value;
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: commentsController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Comments (optional)'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Submit')),
          ],
        );
      },
    );

    if (submitted != true || !mounted) return;

    final provider = Provider.of<InterviewProvider>(context, listen: false);
    final success = await provider.submitFeedback(
      interviewId: interview.id,
      score: scoreController.text.trim().isNotEmpty ? int.tryParse(scoreController.text) : null,
      outcome: outcome,
      comments: commentsController.text.trim().isEmpty ? null : commentsController.text.trim(),
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Feedback submitted' : provider.error ?? 'Failed to submit feedback'),
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
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.warning_amber_outlined, color: Theme.of(context).colorScheme.error, size: 42),
                  const SizedBox(height: 16),
                  Text(
                    'Unable to load interviews',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    provider.error!,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 20),
                  OutlinedButton.icon(
                    onPressed: provider.fetchMyInterviews,
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        if (provider.interviews.isEmpty) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'You have not scheduled any interviews yet. Once you invite candidates, they will appear here with full details.',
                textAlign: TextAlign.center,
              ),
            ),
          );
        }

        final now = DateTime.now();
        final upcoming = provider.interviews.where((i) => i.scheduleTime.isAfter(now)).length;
        final completed = provider.interviews.length - upcoming;

        return RefreshIndicator(
          displacement: 40,
          onRefresh: () => provider.fetchMyInterviews(forceRefresh: true),
          child: Scrollbar(
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate(
                      [
                        _RecruiterInterviewSummary(
                          total: provider.interviews.length,
                          upcoming: upcoming,
                          completed: completed,
                          isProcessing: provider.isProcessing,
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
                        final interview = provider.interviews[index];
                        return _RecruiterInterviewCard(
                          interview: interview,
                          isBusy: provider.isProcessing,
                          onReschedule: () => _reschedule(context, interview),
                          onSubmitFeedback: () => _showFeedbackDialog(context, interview),
                        );
                      },
                      childCount: provider.interviews.length,
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

class _RecruiterInterviewSummary extends StatelessWidget {
  const _RecruiterInterviewSummary({
    required this.total,
    required this.upcoming,
    required this.completed,
    required this.isProcessing,
  });

  final int total;
  final int upcoming;
  final int completed;
  final bool isProcessing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    Widget buildCard({required IconData icon, required String label, required int value, Color? color}) {
      final tint = (color ?? theme.colorScheme.primary).withOpacity(0.08);
      return Container(
        width: 220,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
        decoration: BoxDecoration(
          color: tint,
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
                  '$value',
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
                    'Coordinate interviews effortlessly',
                    style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Stay aligned with interviewers, applicants, and feedback to keep hiring momentum strong.',
                    style: textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            if (isProcessing)
              const Padding(
                padding: EdgeInsets.only(top: 8),
                child: SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
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
                    icon: Icons.groups_outlined,
                    label: 'Total scheduled',
                    value: total,
                  ),
                ),
                SizedBox(
                  width: width,
                  child: buildCard(
                    icon: Icons.calendar_month_outlined,
                    label: 'Upcoming this week',
                    value: upcoming,
                    color: const Color(0xFF2563EB),
                  ),
                ),
                SizedBox(
                  width: width,
                  child: buildCard(
                    icon: Icons.flag_outlined,
                    label: 'Completed',
                    value: completed,
                    color: const Color(0xFF10B981),
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

class _RecruiterInterviewCard extends StatelessWidget {
  const _RecruiterInterviewCard({
    required this.interview,
    required this.isBusy,
    required this.onReschedule,
    required this.onSubmitFeedback,
  });

  final Interview interview;
  final bool isBusy;
  final VoidCallback onReschedule;
  final VoidCallback onSubmitFeedback;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheduleLocal = interview.scheduleTime.toLocal();
    final dateLabel = DateFormat.yMMMMEEEEd().format(scheduleLocal);
    final timeLabel = DateFormat.jm().format(scheduleLocal);
    final candidate = interview.participants
        .firstWhere(
          (p) => p.role.toUpperCase() == 'CANDIDATE',
          orElse: () => InterviewParticipant(userId: 0, role: 'CANDIDATE'),
        )
        .userId;
    final interviewerIds = interview.participants
        .where((p) => p.role.toUpperCase() == 'INTERVIEWER')
        .map((p) => '#${p.userId}')
        .join(', ');
    final outcome = interview.outcome ?? 'Pending';

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
                    child: Icon(Icons.video_call_outlined, color: theme.colorScheme.primary),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Application #${interview.applicationId}',
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$dateLabel • $timeLabel (${interview.timezone ?? 'UTC'})',
                          style: theme.textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Candidate #$candidate',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Chip(
                    backgroundColor: theme.colorScheme.primary.withOpacity(0.08),
                    label: Text(
                      outcome.toUpperCase(),
                      style: TextStyle(
                        color: outcome.toLowerCase() == 'pass'
                            ? const Color(0xFF16A34A)
                            : outcome.toLowerCase() == 'fail'
                                ? const Color(0xFFDC2626)
                                : theme.colorScheme.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
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
                  icon: Icons.devices_other_outlined,
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
              if (interview.feedback.isNotEmpty) ...[
                _InfoRow(
                  icon: Icons.feedback_outlined,
                  label: 'Feedback so far',
                  value: interview.feedback
                      .map(
                        (fb) =>
                            '#${fb.interviewerId}: ${fb.score ?? '-'} pts, ${(fb.outcome ?? 'pending').toUpperCase()}',
                      )
                      .join(' • '),
                ),
                const SizedBox(height: 12),
              ],
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton.icon(
                    onPressed: isBusy ? null : onReschedule,
                    icon: const Icon(Icons.edit_calendar_outlined),
                    label: const Text('Reschedule'),
                  ),
                  const SizedBox(width: 12),
                  FilledButton.icon(
                    onPressed: isBusy ? null : onSubmitFeedback,
                    icon: const Icon(Icons.feedback_outlined),
                    label: const Text('Add feedback'),
                  ),
                ],
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
                style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

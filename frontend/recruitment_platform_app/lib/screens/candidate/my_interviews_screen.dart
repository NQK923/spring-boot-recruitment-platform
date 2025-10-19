import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/interview.dart';
import '../../providers/interview_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';

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
      Provider.of<InterviewProvider>(context, listen: false).fetchMyInterviews();
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

    final message = success
        ? 'Interview rescheduled'
        : provider.error ?? 'Failed to reschedule interview';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Interviews'),
      ),
      body: Consumer<InterviewProvider>(
        builder: (context, provider, _) {
          if (provider.isFetching && provider.interviews.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null && provider.interviews.isEmpty) {
            return EmptyState(
              icon: Icons.error_outline,
              title: 'No interviews scheduled',
              subtitle: provider.error!,
              action: OutlinedButton.icon(
                onPressed: provider.fetchMyInterviews,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            );
          }

          if (provider.interviews.isEmpty) {
            return EmptyState(
              icon: Icons.calendar_month_outlined,
              title: 'You have no upcoming interviews',
              subtitle: 'When interviews are scheduled, you will see the details appear here.',
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchMyInterviews(forceRefresh: true),
            displacement: 30,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              children: [
                SectionHeader(
                  title: 'Upcoming conversations',
                  subtitle: 'Be prepared for your next step in the hiring journey.',
                  trailing: Chip(
                    label: Text('${provider.interviews.length} scheduled'),
                  ),
                ),
                const SizedBox(height: 12),
                ...provider.interviews.map(
                  (interview) => _InterviewCard(
                    interview: interview,
                    onReschedule: () => _reschedule(context, interview),
                    isBusy: provider.isProcessing,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _InterviewCard extends StatelessWidget {
  const _InterviewCard({
    required this.interview,
    required this.onReschedule,
    required this.isBusy,
  });

  final Interview interview;
  final VoidCallback onReschedule;
  final bool isBusy;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localDateTime = interview.scheduleTime.toLocal();
    final dateLabel = DateFormat.yMMMMEEEEd().format(localDateTime);
    final timeLabel = DateFormat.jm().format(localDateTime);
    final interviewerIds = interview.participants
        .where((p) => p.role.toUpperCase() == 'INTERVIEWER')
        .map((p) => '#${p.userId}')
        .join(', ');

    final timelineColor = theme.colorScheme.primary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 18,
              offset: const Offset(0, 14),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    height: 48,
                    width: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: timelineColor.withOpacity(0.12),
                    ),
                    child: Icon(
                      Icons.calendar_today,
                      color: timelineColor,
                    ),
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
                          '$dateLabel • $timeLabel (${interview.timezone ?? 'UTC'})',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
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
                  icon: Icons.video_camera_front_outlined,
                  label: 'Format',
                  value: interview.format!,
                ),
                const SizedBox(height: 12),
              ],
              if ((interview.locationOrLink ?? '').isNotEmpty) ...[
                _InfoRow(
                  icon: Icons.pin_drop_outlined,
                  label: 'Location / Link',
                  value: interview.locationOrLink!,
                ),
                const SizedBox(height: 12),
              ],
              if (interview.outcome != null) ...[
                _InfoRow(
                  icon: Icons.check_circle_outline,
                  label: 'Outcome',
                  value: interview.outcome!,
                  valueColor: const Color(0xFF16A34A),
                ),
                const SizedBox(height: 12),
              ],
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
    this.valueColor,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: theme.textTheme.bodySmall?.color,
        ),
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
                  color: valueColor ?? theme.textTheme.bodyMedium?.color,
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

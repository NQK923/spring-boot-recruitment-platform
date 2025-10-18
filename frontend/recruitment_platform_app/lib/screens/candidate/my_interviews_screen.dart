import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/interview.dart';
import '../../providers/interview_provider.dart';

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

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Interview rescheduled')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'Failed to reschedule interview')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = MaterialLocalizations.of(context);

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
            return Center(child: Text(provider.error!));
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchMyInterviews(forceRefresh: true),
            child: provider.interviews.isEmpty
                ? ListView(
                    children: const [
                      SizedBox(height: 200),
                      Center(child: Text('No interviews scheduled yet.')),
                    ],
                  )
                : ListView.builder(
                    itemCount: provider.interviews.length,
                    itemBuilder: (context, index) {
                      final interview = provider.interviews[index];
                      final localDateTime = interview.scheduleTime.toLocal();
                      final dateLabel = localizations.formatFullDate(localDateTime);
                      final timeLabel = TimeOfDay.fromDateTime(localDateTime).format(context);
                      final interviewerIds = interview.participants
                          .where((p) => p.role.toUpperCase() == 'INTERVIEWER')
                          .map((p) => '#${p.userId}')
                          .join(', ');

                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Interview for application #${interview.applicationId}',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text('When: $dateLabel at $timeLabel'),
                              if (interview.locationOrLink != null && interview.locationOrLink!.isNotEmpty)
                                Text('Location: ${interview.locationOrLink}'),
                              if (interview.format != null)
                                Text('Format: ${interview.format}'),
                              if (interviewerIds.isNotEmpty)
                                Text('Interviewers: $interviewerIds'),
                              if (interview.outcome != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Chip(
                                    label: Text('Outcome: ${interview.outcome}'),
                                  ),
                                ),
                              const SizedBox(height: 12),
                              Align(
                                alignment: Alignment.centerRight,
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.edit_calendar_outlined),
                                  label: const Text('Request Reschedule'),
                                  onPressed: provider.isProcessing
                                      ? null
                                      : () => _reschedule(context, interview),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          );
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';
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
      format: interview.format,
      locationOrLink: interview.locationOrLink,
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

  Future<void> _showFeedbackDialog(BuildContext context, Interview interview) async {
    final scoreController = TextEditingController();
    final commentsController = TextEditingController();
    String outcome = 'PASS';

    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Submit Feedback'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: scoreController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Score (optional)',
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: outcome,
                items: const [
                  DropdownMenuItem(value: 'PASS', child: Text('Pass')),
                  DropdownMenuItem(value: 'FAIL', child: Text('Fail')),
                  DropdownMenuItem(value: 'HOLD', child: Text('Hold')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    outcome = value;
                  }
                },
                decoration: const InputDecoration(labelText: 'Outcome'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: commentsController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Comments (optional)',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Submit'),
            ),
          ],
        );
      },
    );

    if (result != true) return;

    final provider = Provider.of<InterviewProvider>(context, listen: false);
    final score = int.tryParse(scoreController.text);
    final success = await provider.submitFeedback(
      interviewId: interview.id,
      score: score,
      outcome: outcome,
      comments: commentsController.text.trim().isEmpty ? null : commentsController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Feedback submitted')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'Failed to submit feedback')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = MaterialLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Interviews'),
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
                      Center(child: Text('No interviews scheduled.')),
                    ],
                  )
                : ListView.builder(
                    itemCount: provider.interviews.length,
                    itemBuilder: (context, index) {
                      final interview = provider.interviews[index];
                      final localDateTime = interview.scheduleTime.toLocal();
                      final dateLabel = localizations.formatFullDate(localDateTime);
                      final timeLabel = TimeOfDay.fromDateTime(localDateTime).format(context);
                      final candidate = interview.participants
                          .firstWhere(
                            (p) => p.role.toUpperCase() == 'CANDIDATE',
                            orElse: () => InterviewParticipant(userId: 0, role: 'CANDIDATE'),
                          );
                      final interviewerIds = interview.participants
                          .where((p) => p.role.toUpperCase() == 'INTERVIEWER')
                          .map((p) => '#${p.userId}')
                          .join(', ');

                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Application #${interview.applicationId}',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text('Candidate: #${candidate.userId}'),
                              Text('When: $dateLabel at $timeLabel'),
                              if (interview.locationOrLink != null && interview.locationOrLink!.isNotEmpty)
                                Text('Location: ${interview.locationOrLink}'),
                              if (interview.format != null)
                                Text('Format: ${interview.format}'),
                              if (interviewerIds.isNotEmpty)
                                Text('Interviewers: $interviewerIds'),
                              if (interview.feedback.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: interview.feedback.map((fb) {
                                      final outcome = fb.outcome ?? 'PENDING';
                                      return Text(
                                        'Feedback by #${fb.interviewerId}: ${fb.score ?? '-'} pts, $outcome${fb.comments != null ? ' — ${fb.comments}' : ''}',
                                      );
                                    }).toList(),
                                  ),
                                ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  OutlinedButton.icon(
                                    onPressed: provider.isProcessing
                                        ? null
                                        : () => _reschedule(context, interview),
                                    icon: const Icon(Icons.edit_calendar_outlined),
                                    label: const Text('Reschedule'),
                                  ),
                                  const SizedBox(width: 12),
                                  ElevatedButton.icon(
                                    onPressed: provider.isProcessing
                                        ? null
                                        : () => _showFeedbackDialog(context, interview),
                                    icon: const Icon(Icons.feedback_outlined),
                                    label: const Text('Feedback'),
                                  ),
                                ],
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

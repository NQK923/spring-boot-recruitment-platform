import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/schedule_interview_request.dart';
import '../../providers/interview_provider.dart';
import '../../widgets/section_header.dart';

class ScheduleInterviewScreen extends StatefulWidget {
  const ScheduleInterviewScreen({super.key, required this.applicationId, required this.candidateId});

  final int applicationId;
  final int candidateId;

  @override
  State<ScheduleInterviewScreen> createState() => _ScheduleInterviewScreenState();
}

class _ScheduleInterviewScreenState extends State<ScheduleInterviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _formatController = TextEditingController(text: 'ONLINE');
  final _locationController = TextEditingController();
  final _interviewersController = TextEditingController();
  final DateFormat _dateFormat = DateFormat('EEE, MMM d • HH:mm');

  DateTime? _scheduledDateTime;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _formatController.dispose();
    _locationController.dispose();
    _interviewersController.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final now = DateTime.now();
    final initialDate = _scheduledDateTime ?? now.add(const Duration(days: 1));
    final selectedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (selectedDate == null) return;

    final selectedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_scheduledDateTime ?? now),
    );
    if (selectedTime == null) return;

    setState(() {
      _scheduledDateTime = DateTime(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
        selectedTime.hour,
        selectedTime.minute,
      );
    });
  }

  Future<void> _submit(InterviewProvider provider) async {
    if (!_formKey.currentState!.validate() || _scheduledDateTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select a date and complete all fields.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final interviewerIds = _interviewersController.text
        .split(',')
        .map((value) => int.tryParse(value.trim()))
        .where((id) => id != null)
        .cast<int>()
        .toList();

    final request = ScheduleInterviewRequest(
      applicationId: widget.applicationId,
      candidateId: widget.candidateId,
      scheduleTime: _scheduledDateTime!,
      timezone: 'UTC',
      format: _formatController.text.trim(),
      locationOrLink: _locationController.text.trim(),
      interviewerIds: interviewerIds,
    );

    final success = await provider.scheduleInterview(request);

    if (!context.mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Interview scheduled successfully.')),
      );
      Navigator.of(context).pop();
    } else {
      final error = provider.error ?? 'Failed to schedule interview';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Schedule interview'),
      ),
      body: Consumer<InterviewProvider>(
        builder: (context, provider, _) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  const SectionHeader(
                    title: 'Interview details',
                    subtitle: 'Set time, format, and participants for this interview.',
                  ),
                  const SizedBox(height: 16),
                  _ScheduleField(
                    label: 'Scheduled time',
                    value: _scheduledDateTime == null
                        ? 'Tap to choose date & time'
                        : _dateFormat.format(_scheduledDateTime!.toLocal()),
                    icon: Icons.calendar_month_outlined,
                    onTap: _pickDateTime,
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _formatController,
                    decoration: const InputDecoration(
                      labelText: 'Format',
                      hintText: 'e.g. ONLINE, ONSITE, HYBRID',
                    ),
                    validator: (value) => value == null || value.trim().isEmpty ? 'Specify the interview format' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _locationController,
                    decoration: const InputDecoration(
                      labelText: 'Location or link',
                      hintText: 'Meeting link or onsite address',
                    ),
                    validator: (value) => value == null || value.trim().isEmpty ? 'Provide a location or link' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _interviewersController,
                    decoration: const InputDecoration(
                      labelText: 'Interviewer IDs',
                      hintText: 'Comma-separated user IDs (e.g., 12, 34)',
                    ),
                    validator: (value) => value == null || value.trim().isEmpty ? 'Enter at least one interviewer' : null,
                  ),
                  const SizedBox(height: 28),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.close),
                          label: const Text('Cancel'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _isSubmitting ? null : () => _submit(provider),
                          icon: _isSubmitting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.calendar_month),
                          label: Text(_isSubmitting ? 'Scheduling...' : 'Schedule'),
                        ),
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
  }
}

class _ScheduleField extends StatelessWidget {
  const _ScheduleField({
    required this.label,
    required this.value,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        decoration: BoxDecoration(
          color: theme.colorScheme.primary.withOpacity(0.06),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    value,
                    style: theme.textTheme.titleSmall,
                  ),
                ],
              ),
            ),
            const Icon(Icons.edit_calendar_outlined),
          ],
        ),
      ),
    );
  }
}

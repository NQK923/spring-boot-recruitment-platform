import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/schedule_interview_request.dart';
import '../../providers/interview_provider.dart';

class ScheduleInterviewScreen extends StatefulWidget {
  final int applicationId;
  final int candidateId;

  const ScheduleInterviewScreen({super.key, required this.applicationId, required this.candidateId});

  @override
  _ScheduleInterviewScreenState createState() => _ScheduleInterviewScreenState();
}

class _ScheduleInterviewScreenState extends State<ScheduleInterviewScreen> {
  final _formKey = GlobalKey<FormState>();
  DateTime? _selectedDate;
  final _formatController = TextEditingController(text: 'ONLINE');
  final _locationController = TextEditingController();
  final _interviewersController = TextEditingController();
  bool _isLoading = false;

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (time == null) return;

    setState(() {
      _selectedDate = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields and select a date.')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final interviewerIds = _interviewersController.text
        .split(',')
        .map((id) => int.tryParse(id.trim()))
        .where((id) => id != null)
        .cast<int>()
        .toList();

    final request = ScheduleInterviewRequest(
      applicationId: widget.applicationId,
      candidateId: widget.candidateId,
      scheduleTime: _selectedDate!,
      timezone: 'UTC', // Placeholder
      format: _formatController.text,
      locationOrLink: _locationController.text,
      interviewerIds: interviewerIds,
    );

    final success = await Provider.of<InterviewProvider>(context, listen: false).scheduleInterview(request);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Interview scheduled successfully!')),
        );
        Navigator.of(context).pop();
      } else {
        final error = Provider.of<InterviewProvider>(context, listen: false).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error ?? 'Failed to schedule interview')),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Schedule Interview')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              ListTile(
                title: Text(_selectedDate == null
                    ? 'No date chosen!'
                    : '${_selectedDate!.toLocal()}'),
                trailing: const Icon(Icons.calendar_today),
                onTap: _pickDate,
              ),
              TextFormField(
                controller: _formatController,
                decoration: const InputDecoration(labelText: 'Format (e.g., ONLINE, OFFLINE)'),
                validator: (value) => value!.isEmpty ? 'Please enter a format' : null,
              ),
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(labelText: 'Location or Link'),
                validator: (value) => value!.isEmpty ? 'Please enter a location/link' : null,
              ),
              TextFormField(
                controller: _interviewersController,
                decoration: const InputDecoration(labelText: 'Interviewer IDs (comma-separated)'),
                validator: (value) => value!.isEmpty ? 'Please enter at least one interviewer ID' : null,
              ),
              const SizedBox(height: 20),
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _submit,
                      child: const Text('Schedule'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}

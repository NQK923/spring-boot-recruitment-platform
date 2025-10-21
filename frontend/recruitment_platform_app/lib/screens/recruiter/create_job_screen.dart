import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/create_job_request.dart';
import '../../providers/recruiter_provider.dart';
import '../../widgets/section_header.dart';

class CreateJobScreen extends StatefulWidget {
  const CreateJobScreen({super.key});

  @override
  State<CreateJobScreen> createState() => _CreateJobScreenState();
}

class _CreateJobScreenState extends State<CreateJobScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _requirementsController = TextEditingController();
  final _locationController = TextEditingController();
  final _workTypeController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _requirementsController.dispose();
    _locationController.dispose();
    _workTypeController.dispose();
    super.dispose();
  }

  Future<void> _submit(RecruiterProvider provider) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSubmitting = true);

    final request = CreateJobRequest(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      requirements: _requirementsController.text.trim(),
      location: _locationController.text.trim(),
      workType: _workTypeController.text.trim(),
    );

    final success = await provider.createJob(request);

    if (!context.mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Job created successfully.')),
      );
      Navigator.of(context).pop();
    } else {
      final message = provider.error ?? 'Failed to create job';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create job posting'),
      ),
      body: Consumer<RecruiterProvider>(
        builder: (context, provider, _) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  const SectionHeader(
                    title: 'Position information',
                    subtitle: 'Share details that help candidates understand the opportunity.',
                  ),
                  const SizedBox(height: 16),
                  Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 0,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextFormField(
                            controller: _titleController,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'Job title',
                              hintText: 'e.g. Senior Backend Engineer',
                            ),
                            validator: (value) => value == null || value.trim().isEmpty ? 'Please enter a title' : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _locationController,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'Location',
                              hintText: 'e.g. Berlin, Remote EMEA',
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _workTypeController,
                            decoration: const InputDecoration(
                              labelText: 'Work arrangement',
                              hintText: 'Remote, On-site, Hybrid',
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _descriptionController,
                            minLines: 4,
                            maxLines: 6,
                            decoration: const InputDecoration(
                              labelText: 'Role description',
                              hintText: 'Explain the mission, responsibilities, and impact of the role.',
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _requirementsController,
                            minLines: 4,
                            maxLines: 6,
                            decoration: const InputDecoration(
                              labelText: 'Key requirements',
                              hintText: 'List required skills, experience, or qualifications.',
                            ),
                          ),
                        ],
                      ),
                    ),
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
                              : const Icon(Icons.send_outlined),
                          label: Text(_isSubmitting ? 'Creating...' : 'Publish job'),
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

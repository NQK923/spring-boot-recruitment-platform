import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/application.dart';
import '../../providers/recruiter_provider.dart';
import './candidate_profile_screen.dart';
import './schedule_interview_screen.dart';
import '../../models/application_note.dart';

class CandidateListScreen extends StatefulWidget {
  final int jobId;
  final String jobTitle;

  const CandidateListScreen({super.key, required this.jobId, required this.jobTitle});

  @override
  _CandidateListScreenState createState() => _CandidateListScreenState();
}

class _CandidateListScreenState extends State<CandidateListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RecruiterProvider>(context, listen: false).fetchApplicationsForJob(widget.jobId);
    });
  }

  void _changeStatus(Application app, String newStatus) {
    Provider.of<RecruiterProvider>(context, listen: false)
        .updateApplicationStatus(app.id, newStatus)
        .then((success) {
      if (!success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status')),
        );
      }
    });
  }

  Future<void> _showNotes(Application app) async {
    final recruiterProvider = Provider.of<RecruiterProvider>(context, listen: false);
    await recruiterProvider.fetchNotesForApplication(app.id);
    if (!mounted) return;

    final noteController = TextEditingController();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: Consumer<RecruiterProvider>(
            builder: (context, provider, _) {
              final List<ApplicationNote> notes = provider.notesForApplication(app.id);
              return SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Notes for application #${app.id}',
                              style: Theme.of(context).textTheme.titleMedium),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => Navigator.of(ctx).pop(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (provider.isNotesLoading)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: CircularProgressIndicator(),
                        )
                      else if (provider.notesError != null && notes.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: Text(provider.notesError!),
                        )
                      else if (notes.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Text('No notes yet. Add one below.'),
                        )
                      else
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 300),
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: notes.length,
                            itemBuilder: (context, index) {
                              final note = notes[index];
                              return ListTile(
                                leading: const Icon(Icons.note_alt_outlined),
                                title: Text(note.content),
                                subtitle: Text(
                                  'Author: #${note.authorUserId} on ${note.createdAt.toLocal().toString().split(' ').first}',
                                ),
                              );
                            },
                          ),
                        ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: noteController,
                        decoration: const InputDecoration(
                          labelText: 'Add a note',
                          border: OutlineInputBorder(),
                        ),
                        minLines: 1,
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: provider.isNotesLoading
                              ? null
                              : () async {
                                  final text = noteController.text.trim();
                                  if (text.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Please enter a note.')),
                                    );
                                    return;
                                  }

                                  final success = await recruiterProvider.addNoteToApplication(app.id, text);
                                  if (success) {
                                    noteController.clear();
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(provider.notesError ?? 'Failed to add note')),
                                    );
                                  }
                                },
                          icon: const Icon(Icons.add_comment_outlined),
                          label: const Text('Add Note'),
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
    );
    noteController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const List<String> statuses = ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'];

    return Scaffold(
      appBar: AppBar(
        title: Text('Applicants for ${widget.jobTitle}'),
      ),
      body: Consumer<RecruiterProvider>(
        builder: (context, recruiterProvider, child) {
          if (recruiterProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (recruiterProvider.error != null) {
            return Center(child: Text('An error occurred: ${recruiterProvider.error}'));
          }

          if (recruiterProvider.applicationsForJob.isEmpty) {
            return const Center(child: Text('No applicants for this job yet.'));
          }

          return ListView.builder(
            itemCount: recruiterProvider.applicationsForJob.length,
            itemBuilder: (ctx, i) {
              final app = recruiterProvider.applicationsForJob[i];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(app.candidateName ?? 'Candidate ID: ${app.candidateId}'),
                        subtitle: Text('Applied on: ${app.appliedAt.toLocal().toString().split(' ')[0]}'),
                        onTap: () {
                          Navigator.of(context).push(MaterialPageRoute(
                            builder: (ctx) => CandidateProfileScreen(candidateId: app.candidateId),
                          ));
                        },
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: DropdownButton<String>(
                              value: app.status,
                              isExpanded: true,
                              items: statuses.map<DropdownMenuItem<String>>((String value) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: Text(value, style: const TextStyle(fontSize: 14)),
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                if (newValue != null && newValue != app.status) {
                                  _changeStatus(app, newValue);
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          TextButton.icon(
                            icon: const Icon(Icons.sticky_note_2_outlined, size: 18),
                            label: const Text('Notes'),
                            onPressed: () => _showNotes(app),
                          ),
                          TextButton.icon(
                            icon: const Icon(Icons.calendar_month, size: 18),
                            label: const Text('Schedule'),
                            onPressed: () {
                               Navigator.of(context).push(MaterialPageRoute(
                                builder: (ctx) => ScheduleInterviewScreen(
                                  applicationId: app.id,
                                  candidateId: app.candidateId,
                                ),
                              ));
                            },
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

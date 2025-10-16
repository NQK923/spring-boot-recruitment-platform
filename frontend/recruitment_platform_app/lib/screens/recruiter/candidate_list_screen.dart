import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/application.dart';
import '../../providers/recruiter_provider.dart';
import './candidate_profile_screen.dart';
import './schedule_interview_screen.dart';

class CandidateListScreen extends StatefulWidget {
  final int jobId;
  final String jobTitle;

  const CandidateListScreen({Key? key, required this.jobId, required this.jobTitle}) : super(key: key);

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
                          DropdownButton<String>(
                            value: app.status,
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
                          )
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

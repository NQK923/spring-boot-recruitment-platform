import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/recruiter_provider.dart';
import './candidate_list_screen.dart';
import './create_job_screen.dart';

class JobPostingsScreen extends StatelessWidget {
  const JobPostingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Company\'s Jobs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.of(context).push(MaterialPageRoute(
                builder: (ctx) => const CreateJobScreen(),
              ));
            },
          ),
        ],
      ),
      body: Consumer<RecruiterProvider>(
        builder: (context, recruiterProvider, child) {
          if (recruiterProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (recruiterProvider.error != null) {
            return Center(child: Text('An error occurred: ${recruiterProvider.error}'));
          }

          if (recruiterProvider.companyJobs.isEmpty) {
            return const Center(child: Text('No jobs found for your company.'));
          }

          return ListView.builder(
            itemCount: recruiterProvider.companyJobs.length,
            itemBuilder: (ctx, i) {
              final job = recruiterProvider.companyJobs[i];
              return ListTile(
                title: Text(job.title),
                subtitle: Text(job.description, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: JobStatusBadge(status: job.status),
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(
                    builder: (ctx) => CandidateListScreen(
                      jobId: job.id,
                      jobTitle: job.title,
                    ),
                  ));
                },
              );
            },
          );
        },
      ),
    );
  }
}

class JobStatusBadge extends StatelessWidget {
  const JobStatusBadge({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final normalized = status.toUpperCase();
    final color = _statusColor(normalized);
    return Chip(
      label: Text(
        _formatStatus(normalized),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
        ),
      ),
      backgroundColor: color.withOpacity(0.12),
      side: BorderSide(color: color.withOpacity(0.4)),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
    );
  }

  static String _formatStatus(String raw) {
    final lower = raw.toLowerCase();
    return lower.isEmpty ? 'Unknown' : '${lower[0].toUpperCase()}${lower.substring(1)}';
  }

  static Color _statusColor(String normalized) {
    switch (normalized) {
      case 'OPEN':
        return Colors.green.shade700;
      case 'PAUSED':
        return Colors.orange.shade700;
      case 'CLOSED':
        return Colors.red.shade700;
      case 'DRAFT':
        return Colors.blueGrey.shade600;
      default:
        return Colors.grey.shade600;
    }
  }
}

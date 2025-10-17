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
                // TODO: Add job status chip
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

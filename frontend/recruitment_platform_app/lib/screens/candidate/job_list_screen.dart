import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/job_provider.dart';
import './job_detail_screen.dart';

class JobListScreen extends StatelessWidget {
  const JobListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Jobs'),
      ),
      body: Consumer<JobProvider>(
        builder: (context, jobProvider, child) {
          if (jobProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (jobProvider.error != null) {
            return Center(child: Text('An error occurred: ${jobProvider.error}'));
          }

          if (jobProvider.jobs.isEmpty) {
            return const Center(child: Text('No jobs found.'));
          }

          return ListView.builder(
            itemCount: jobProvider.jobs.length,
            itemBuilder: (ctx, i) => ListTile(
              title: Text(jobProvider.jobs[i].title),
              subtitle: Text(
                jobProvider.jobs[i].description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              onTap: () {
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (ctx) => JobDetailScreen(job: jobProvider.jobs[i]),
                ));
              },
            ),
          );
        },
      ),
    );
  }
}

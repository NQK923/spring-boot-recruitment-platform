import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/job.dart';
import '../../providers/application_provider.dart';
import '../../providers/profile_provider.dart';

class JobDetailScreen extends StatelessWidget {
  final Job job;

  const JobDetailScreen({Key? key, required this.job}) : super(key: key);

  void _apply(BuildContext context) {
    final profile = Provider.of<ProfileProvider>(context, listen: false).profile;
    if (profile == null || profile.cvs.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload a CV to your profile before applying.')),
      );
      return;
    }

    // For simplicity, we'll just use the first CV. A real app would show a selector.
    final cvId = profile.cvs.first.id;

    Provider.of<ApplicationProvider>(context, listen: false)
        .applyForJob(job.id, cvId)
        .then((success) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully applied!')),
        );
        Navigator.of(context).pop();
      } else {
        final error = Provider.of<ApplicationProvider>(context, listen: false).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error ?? 'Failed to apply')),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(job.title)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(job.title, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 10),
            Text(job.description, style: Theme.of(context).textTheme.bodyMedium),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _apply(context),
                child: const Text('Apply Now'),
              ),
            )
          ],
        ),
      ),
    );
  }
}

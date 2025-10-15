import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/application_provider.dart';

class MyApplicationsScreen extends StatelessWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
      ),
      body: Consumer<ApplicationProvider>(
        builder: (context, appProvider, child) {
          if (appProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (appProvider.error != null) {
            return Center(child: Text('An error occurred: ${appProvider.error}'));
          }

          if (appProvider.applications.isEmpty) {
            return const Center(child: Text('You have not submitted any applications yet.'));
          }

          return ListView.builder(
            itemCount: appProvider.applications.length,
            itemBuilder: (ctx, i) {
              final app = appProvider.applications[i];
              return ListTile(
                title: Text('Application for Job #${app.jobPostingId}'), // TODO: Get job title
                subtitle: Text('Status: ${app.status}'),
                trailing: Text(app.appliedAt.toLocal().toString().split(' ')[0]),
              );
            },
          );
        },
      ),
    );
  }
}

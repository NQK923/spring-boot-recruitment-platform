import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/recruiter_provider.dart';

class CandidateProfileScreen extends StatefulWidget {
  final int candidateId;

  const CandidateProfileScreen({super.key, required this.candidateId});

  @override
  _CandidateProfileScreenState createState() => _CandidateProfileScreenState();
}

class _CandidateProfileScreenState extends State<CandidateProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RecruiterProvider>(context, listen: false).fetchCandidateProfile(widget.candidateId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Candidate Profile'),
      ),
      body: Consumer<RecruiterProvider>(
        builder: (context, recruiterProvider, child) {
          final profile = recruiterProvider.viewingCandidateProfile;

          if (recruiterProvider.isLoading && profile == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (recruiterProvider.error != null && profile == null) {
            return Center(child: Text('Error: ${recruiterProvider.error}'));
          }

          if (profile == null) {
            return const Center(child: Text('No profile data found.'));
          }

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListView(
              children: [
                Text(profile.fullName ?? 'No Name', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text('Phone: ${profile.phoneNumber ?? 'N/A'}'),
                const SizedBox(height: 20),
                Text('Summary', style: Theme.of(context).textTheme.titleMedium),
                const Divider(),
                Text(profile.summary ?? 'No summary provided.'),
                const SizedBox(height: 30),
                Text('CVs', style: Theme.of(context).textTheme.titleMedium),
                const Divider(),
                if (profile.cvs.isEmpty)
                  const Text('No CVs available.'),
                ...profile.cvs.map((cv) => ListTile(
                      leading: const Icon(Icons.description),
                      title: Text(cv.versionName),
                      trailing: cv.isDefault ? const Chip(label: Text('Default')) : null,
                      onTap: () {
                        // TODO: Implement CV download/view
                      },
                    )),
              ],
            ),
          );
        },
      ),
    );
  }
}

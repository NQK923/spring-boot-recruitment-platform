import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/profile.dart';
import '../../providers/profile_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _fullNameController;
  late TextEditingController _phoneController;
  late TextEditingController _summaryController;

  @override
  void initState() {
    super.initState();
    final profile = Provider.of<ProfileProvider>(context, listen: false).profile;
    _fullNameController = TextEditingController(text: profile?.fullName ?? '');
    _phoneController = TextEditingController(text: profile?.phoneNumber ?? '');
    _summaryController = TextEditingController(text: profile?.summary ?? '');
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Update controllers if profile re-fetches
    final profile = Provider.of<ProfileProvider>(context).profile;
     _fullNameController.text = profile?.fullName ?? '';
     _phoneController.text = profile?.phoneNumber ?? '';
     _summaryController.text = profile?.summary ?? '';
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _summaryController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
      final updatedProfile = Profile(
        userId: profileProvider.profile!.userId,
        fullName: _fullNameController.text,
        phoneNumber: _phoneController.text,
        summary: _summaryController.text,
      );

      final success = await profileProvider.updateMyProfile(updatedProfile);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(success ? 'Profile updated!' : 'Failed to update profile.')),
        );
      }
    }
  }

  Future<void> _uploadCv() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      withData: kIsWeb,
    );

    if (result != null) {
      final PlatformFile file = result.files.first;
      final versionName = await _showVersionNameDialog() ?? 'CV ${DateTime.now().toIso8601String()}';

      if (!mounted) return;

      final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
      bool success = false;

      if (file.path != null || file.bytes != null) {
        success = await profileProvider.uploadCv(
          versionName: versionName,
          filePath: file.path,
          fileBytes: file.bytes,
          fileName: file.name,
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to read the selected file.')),
        );
        return;
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(success ? 'CV uploaded!' : 'Failed to upload CV.')),
        );
      }
    } else {
      // User canceled the picker
    }
  }

  Future<void> _generateCv() async {
    String versionName = await _showVersionNameDialog() ?? 'Generated CV ${DateTime.now().toIso8601String()}';

    final success = await Provider.of<ProfileProvider>(context, listen: false)
        .generateCv(versionName);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(success ? 'CV generated!' : 'Failed to generate CV.')),
      );
    }
  }

  Future<String?> _showVersionNameDialog() {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('CV Version Name'),
        content: TextField(controller: controller, decoration: const InputDecoration(hintText: "e.g., 'Software Engineer CV'")),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveProfile,
          ),
        ],
      ),
      body: Consumer<ProfileProvider>(
        builder: (context, profileProvider, child) {
          if (profileProvider.isLoading && profileProvider.profile == null) {
            return const Center(child: CircularProgressIndicator());
          }
          if (profileProvider.error != null && profileProvider.profile == null) {
            return Center(child: Text('Error: ${profileProvider.error}'));
          }

          final profile = profileProvider.profile;

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  Text('User Info', style: Theme.of(context).textTheme.headlineSmall),
                  const Divider(),
                  TextFormField(
                    controller: _fullNameController,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                  ),
                  TextFormField(
                    controller: _phoneController,
                    decoration: const InputDecoration(labelText: 'Phone Number'),
                  ),
                  TextFormField(
                    controller: _summaryController,
                    decoration: const InputDecoration(labelText: 'Summary'),
                    maxLines: 5,
                  ),
                  const SizedBox(height: 30),
                  Text('My CVs', style: Theme.of(context).textTheme.headlineSmall),
                  const Divider(),
                  if (profile?.cvs.isEmpty ?? true)
                    const Text('No CVs uploaded yet.'),
                  if (profile != null)
                    ...profile.cvs.map((cv) => ListTile(
                          leading: const Icon(Icons.description),
                          title: Text(cv.versionName),
                          trailing: cv.isDefault ? const Chip(label: Text('Default')) : null,
                        )),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: profileProvider.isLoading ? null : _uploadCv,
                    icon: const Icon(Icons.upload_file),
                    label: const Text('Upload New CV'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: profileProvider.isLoading ? null : _generateCv,
                    icon: const Icon(Icons.auto_fix_high_outlined),
                    label: const Text('Generate CV from profile'),
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

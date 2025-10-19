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
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          FilledButton.icon(
            onPressed: _saveProfile,
            icon: const Icon(Icons.save_outlined),
            label: const Text('Save'),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Consumer<ProfileProvider>(
        builder: (context, profileProvider, child) {
          if (profileProvider.isLoading && profileProvider.profile == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (profileProvider.error != null && profileProvider.profile == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline, color: theme.colorScheme.error, size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'We couldn’t load your profile',
                      style: theme.textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      profileProvider.error!,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 20),
                    OutlinedButton.icon(
                      onPressed: profileProvider.fetchMyProfile,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final profile = profileProvider.profile;

          return Stack(
            children: [
              RefreshIndicator(
                onRefresh: profileProvider.fetchMyProfile,
                displacement: 28,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  children: [
                    _buildHeader(
                      fullName: _fullNameController.text.isNotEmpty
                          ? _fullNameController.text
                          : 'Your name',
                      email: profileProvider.authProvider.user?.email ?? '',
                      summary: _summaryController.text,
                    ),
                    Transform.translate(
                      offset: const Offset(0, -50),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _buildProfileCard(context, profileProvider, profile),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
              if (profileProvider.isLoading)
                const Align(
                  alignment: Alignment.topCenter,
                  child: LinearProgressIndicator(minHeight: 2),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProfileCard(
    BuildContext context,
    ProfileProvider provider,
    Profile? profile,
  ) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            offset: const Offset(0, 20),
            blurRadius: 40,
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(22, 26, 22, 28),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Personal details',
              style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _fullNameController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Full name',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone number',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _summaryController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Professional summary',
                alignLabelWithHint: true,
                prefixIcon: Icon(Icons.subject_outlined),
              ),
            ),
            const SizedBox(height: 30),
            Row(
              children: [
                Text(
                  'Curriculum vitae',
                  style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(width: 8),
                if (profile?.cvs.isNotEmpty ?? false)
                  Chip(
                    label: Text('${profile!.cvs.length} uploaded'),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (profile?.cvs.isEmpty ?? true)
              Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(18),
                ),
                padding: const EdgeInsets.all(18),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.upload_file, color: theme.colorScheme.primary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Upload your first CV to quickly apply for roles and let recruiters learn more about your experience.',
                        style: textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              )
            else
              Column(
                children: profile!.cvs
                    .map(
                      (cv) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                          color: theme.colorScheme.surface,
                          border: Border.all(
                            color: cv.isDefault
                                ? theme.colorScheme.primary.withOpacity(0.25)
                                : Colors.grey.withOpacity(0.15),
                          ),
                        ),
                        child: ListTile(
                          leading: Container(
                            height: 44,
                            width: 44,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: theme.colorScheme.primary.withOpacity(0.12),
                            ),
                            child: Icon(
                              cv.isDefault ? Icons.star_rounded : Icons.description_outlined,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                          title: Text(
                            cv.versionName,
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            'File ID: ${cv.fileId}',
                            style: textTheme.bodySmall,
                          ),
                          trailing: cv.isDefault
                              ? Chip(
                                  backgroundColor:
                                      theme.colorScheme.primary.withOpacity(0.12),
                                  label: Text(
                                    'Default',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                      ),
                    )
                    .toList(),
              ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: provider.isLoading ? null : _uploadCv,
                    icon: const Icon(Icons.upload_file),
                    label: const Text('Upload CV'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: provider.isLoading ? null : _generateCv,
                    icon: const Icon(Icons.auto_fix_high_outlined),
                    label: const Text('Generate CV'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader({
    required String fullName,
    required String email,
    required String summary,
  }) {
    final theme = Theme.of(context);
    final initials = fullName.trim().isEmpty
        ? 'YOU'
        : fullName.trim().split(' ').take(2).map((e) => e.isNotEmpty ? e[0] : '').join().toUpperCase();

    return Container(
      height: 240,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primary.withOpacity(0.85),
            theme.colorScheme.secondary.withOpacity(0.85),
          ],
        ),
      ),
      padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 76,
                width: 76,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.15),
                ),
                child: Center(
                  child: Text(
                    initials,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fullName.isEmpty ? 'Complete your profile' : fullName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      email.isEmpty ? 'Add an email address' : email,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.85),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            summary.isEmpty
                ? 'Tell recruiters about your experience, achievements, and what excites you.'
                : summary,
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 15,
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

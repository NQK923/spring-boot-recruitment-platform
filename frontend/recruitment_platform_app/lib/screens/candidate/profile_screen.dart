import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/cv.dart';
import '../../models/education.dart';
import '../../models/experience.dart';
import '../../models/profile.dart';
import '../../models/skill.dart';
import '../../providers/profile_provider.dart';
import '../../widgets/section_header.dart';

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
  String? _downloadingCvId;
  final DateFormat _monthYearFormat = DateFormat('MMM yyyy');
  final DateFormat _cvTimestampFormat = DateFormat('MMM d, yyyy â€¢ HH:mm');

  @override
  void initState() {
    super.initState();
    final profile =
        Provider.of<ProfileProvider>(context, listen: false).profile;
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
      final profileProvider = Provider.of<ProfileProvider>(
        context,
        listen: false,
      );
      final updatedProfile = Profile(
        userId: profileProvider.profile!.userId,
        fullName: _fullNameController.text,
        phoneNumber: _phoneController.text,
        summary: _summaryController.text,
      );

      final success = await profileProvider.updateMyProfile(updatedProfile);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? 'Profile updated!' : 'Failed to update profile.',
            ),
          ),
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
      final versionName =
          await _showVersionNameDialog() ??
          'CV ${DateTime.now().toIso8601String()}';

      if (!mounted) return;

      final profileProvider = Provider.of<ProfileProvider>(
        context,
        listen: false,
      );
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
          SnackBar(
            content: Text(success ? 'CV uploaded!' : 'Failed to upload CV.'),
          ),
        );
      }
    } else {
      // User canceled the picker
    }
  }

  Future<void> _generateCv() async {
    String versionName =
        await _showVersionNameDialog() ??
        'Generated CV ${DateTime.now().toIso8601String()}';

    final success = await Provider.of<ProfileProvider>(
      context,
      listen: false,
    ).generateCv(versionName);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'CV generated!' : 'Failed to generate CV.'),
        ),
      );
    }
  }

  Future<void> _downloadCv(Cv cv) async {
    if (cv.fileId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('This CV does not have an attached file yet.'),
        ),
      );
      return;
    }

    setState(() {
      _downloadingCvId = cv.fileId;
    });

    try {
      final provider = Provider.of<ProfileProvider>(context, listen: false);
      final location = await provider.downloadCv(cv);
      if (!mounted) return;
      final messenger = ScaffoldMessenger.of(context);
      messenger.showSnackBar(SnackBar(content: Text(location)));
    } catch (e) {
      if (!mounted) return;
      final messenger = ScaffoldMessenger.of(context);
      final message = e.toString().replaceFirst('Exception: ', '');
      messenger.showSnackBar(
        SnackBar(content: Text('Failed to download CV: $message')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _downloadingCvId = null;
        });
      }
    }
  }

  Future<String?> _showVersionNameDialog() {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('CV Version Name'),
            content: TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: "e.g., 'Software Engineer CV'",
              ),
            ),
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

          if (profileProvider.error != null &&
              profileProvider.profile == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: theme.colorScheme.error,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'We couldnâ€™t load your profile',
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
                      fullName:
                          _fullNameController.text.isNotEmpty
                              ? _fullNameController.text
                              : 'Your name',
                      email: profileProvider.authProvider.user?.email ?? '',
                      summary: _summaryController.text,
                    ),
                    Transform.translate(
                      offset: const Offset(0, -50),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _buildProfileCard(
                          context,
                          profileProvider,
                          profile,
                        ),
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
    final cvs = profile?.cvs ?? const <Cv>[];
    final experiences = profile?.experiences ?? const <Experience>[];
    final education = profile?.education ?? const <Education>[];
    final skills = profile?.skills ?? const <Skill>[];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(15),
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
            SectionHeader(
              title: 'Personal details',
              subtitle:
                  'These details are shared with recruiters when you apply.',
              padding: EdgeInsets.zero,
            ),
            const SizedBox(height: 12),
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
            SectionHeader(
              title: 'Curriculum vitae',
              subtitle:
                  'Keep different resume versions ready to share or download.',
              padding: EdgeInsets.zero,
              trailing:
                  cvs.isNotEmpty
                      ? Chip(label: Text('${cvs.length} uploaded'))
                      : null,
            ),
            const SizedBox(height: 12),
            _buildCvSection(provider, cvs, textTheme),
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
            const SizedBox(height: 32),
            SectionHeader(
              title: 'Experience',
              subtitle: 'Highlight the roles that shape your journey.',
              padding: EdgeInsets.zero,
            ),
            const SizedBox(height: 12),
            _buildExperienceSection(experiences),
            const SizedBox(height: 32),
            SectionHeader(
              title: 'Education',
              subtitle: 'Share the schools and programs you completed.',
              padding: EdgeInsets.zero,
            ),
            const SizedBox(height: 12),
            _buildEducationSection(education),
            const SizedBox(height: 32),
            SectionHeader(
              title: 'Skills',
              subtitle: 'Make it easy for recruiters to spot your strengths.',
              padding: EdgeInsets.zero,
            ),
            const SizedBox(height: 12),
            _buildSkillsSection(skills),
          ],
        ),
      ),
    );
  }

  Widget _buildCvSection(
    ProfileProvider provider,
    List<Cv> cvs,
    TextTheme textTheme,
  ) {
    final theme = Theme.of(context);

    if (cvs.isEmpty) {
      return _buildSectionEmptyState(
        icon: Icons.upload_file_outlined,
        title: 'No CV uploaded yet',
        subtitle:
            'Upload or generate a CV so recruiters can review your profile quickly.',
      );
    }

    return Column(
      children:
          cvs.map((cv) {
            final isDownloading =
                _downloadingCvId != null && _downloadingCvId == cv.fileId;
            final createdAtLabel = _formatCvTimestamp(cv.createdAt);

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                color: theme.colorScheme.surface,
                border: Border.all(
                  color:
                      cv.isDefault
                          ? theme.colorScheme.primary.withAlpha(64)
                          : Colors.grey.withAlpha(38),
                ),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 12,
                ),
                leading: Container(
                  height: 44,
                  width: 44,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: theme.colorScheme.primary.withAlpha(31),
                  ),
                  child: Icon(
                    cv.isDefault
                        ? Icons.star_rounded
                        : Icons.description_outlined,
                    color: theme.colorScheme.primary,
                  ),
                ),
                title: Text(
                  cv.versionName,
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (createdAtLabel != null)
                      Text(createdAtLabel, style: textTheme.bodySmall),
                    Text(
                      cv.fileId != null
                          ? 'File ID: ${cv.fileId}'
                          : 'File not yet available',
                      style: textTheme.bodySmall,
                    ),
                  ],
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (cv.isDefault)
                      Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: Chip(
                          backgroundColor: theme.colorScheme.primary.withAlpha(
                            31,
                          ),
                          label: Text(
                            'Default',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ),
                      ),
                    IconButton(
                      tooltip:
                          cv.fileId == null
                              ? 'No file to download'
                              : 'Download',
                      onPressed:
                          (cv.fileId == null ||
                                  isDownloading ||
                                  provider.isLoading)
                              ? null
                              : () => _downloadCv(cv),
                      icon:
                          isDownloading
                              ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                              : const Icon(Icons.download_outlined),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
    );
  }

  Widget _buildExperienceSection(List<Experience> experiences) {
    if (experiences.isEmpty) {
      return _buildSectionEmptyState(
        icon: Icons.work_outline,
        title: 'Share your professional story',
        subtitle:
            'Add roles, achievements, and responsibilities to help recruiters understand your background.',
      );
    }

    return Column(children: experiences.map(_buildExperienceCard).toList());
  }

  Widget _buildEducationSection(List<Education> educationItems) {
    if (educationItems.isEmpty) {
      return _buildSectionEmptyState(
        icon: Icons.school_outlined,
        title: 'Add your education',
        subtitle:
            'Include schools, degrees, and dates so recruiters see your academic foundation.',
      );
    }

    return Column(children: educationItems.map(_buildEducationCard).toList());
  }

  Widget _buildSkillsSection(List<Skill> skills) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final visibleSkills =
        skills.where((skill) => skill.name.trim().isNotEmpty).toList();

    if (visibleSkills.isEmpty) {
      return _buildSectionEmptyState(
        icon: Icons.psychology_alt_outlined,
        title: 'List the skills you rely on',
        subtitle:
            'Adding skills helps your profile show up in more recruiter searches.',
      );
    }

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children:
          visibleSkills
              .map(
                (skill) => Chip(
                  label: Text(skill.name),
                  backgroundColor: theme.colorScheme.primary.withAlpha(20),
                  labelStyle: textTheme.bodyMedium,
                ),
              )
              .toList(),
    );
  }

  Widget _buildExperienceCard(Experience experience) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final period = _formatDateRange(experience.startDate, experience.endDate);
    final description = experience.description?.trim();
    final title =
        experience.title.trim().isEmpty
            ? 'Untitled position'
            : experience.title.trim();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor.withAlpha(102)),
        color: theme.colorScheme.surface,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          if (experience.companyName.trim().isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              experience.companyName.trim(),
              style: textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ],
          if (period != null) ...[
            const SizedBox(height: 4),
            Text(period, style: textTheme.bodySmall),
          ],
          if (description != null && description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(description, style: textTheme.bodyMedium),
          ],
        ],
      ),
    );
  }

  Widget _buildEducationCard(Education education) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final period = _formatDateRange(education.startDate, education.endDate);
    final school =
        education.school.trim().isEmpty
            ? 'School not specified'
            : education.school.trim();
    final degree =
        education.degree.trim().isEmpty ? null : education.degree.trim();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor.withAlpha(102)),
        color: theme.colorScheme.surface,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            school,
            style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          if (degree != null) ...[
            const SizedBox(height: 4),
            Text(degree, style: textTheme.bodyMedium),
          ],
          if (period != null) ...[
            const SizedBox(height: 4),
            Text(period, style: textTheme.bodySmall),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(89),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: theme.colorScheme.primary),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(subtitle, style: textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String? _formatDateRange(DateTime? start, DateTime? end) {
    if (start == null && end == null) {
      return null;
    }

    final startLabel = start != null ? _monthYearFormat.format(start) : null;
    final endLabel = end != null ? _monthYearFormat.format(end) : 'Present';

    if (startLabel != null) {
      return '$startLabel - $endLabel';
    }

    return endLabel;
  }

  String? _formatCvTimestamp(DateTime? date) {
    if (date == null) {
      return null;
    }
    final local = date.toLocal();
    return 'Created ${_cvTimestampFormat.format(local)}';
  }

  Widget _buildHeader({
    required String fullName,
    required String email,
    required String summary,
  }) {
    final theme = Theme.of(context);
    final initials =
        fullName.trim().isEmpty
            ? 'YOU'
            : fullName
                .trim()
                .split(' ')
                .take(2)
                .map((e) => e.isNotEmpty ? e[0] : '')
                .join()
                .toUpperCase();

    return Container(
      height: 240,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primary.withAlpha(217),
            theme.colorScheme.secondary.withAlpha(217),
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
                  color: Colors.white.withAlpha(38),
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
                        color: Colors.white.withAlpha(217),
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
            style: TextStyle(color: Colors.white.withAlpha(230), fontSize: 15),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

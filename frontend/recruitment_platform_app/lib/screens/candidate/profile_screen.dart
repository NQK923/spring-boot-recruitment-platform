import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/cv.dart';
import '../../models/education.dart';
import '../../models/experience.dart';
import '../../models/profile.dart';
import '../../providers/profile_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _fullNameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _summaryController;

  Profile? _syncedProfile;
  bool _isSavingProfile = false;
  bool _isUploadingCv = false;
  bool _isGeneratingCv = false;
  String? _downloadingFileId;

  final DateFormat _monthYearFormat = DateFormat('MMM yyyy');
  final DateFormat _cvTimestampFormat = DateFormat('MMM d, yyyy � HH:mm');

  @override
  void initState() {
    super.initState();
    final profile = context.read<ProfileProvider>().profile;
    _fullNameController = TextEditingController(text: profile?.fullName ?? '');
    _phoneController = TextEditingController(text: profile?.phoneNumber ?? '');
    _summaryController = TextEditingController(text: profile?.summary ?? '');
    _syncedProfile = profile;
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _summaryController.dispose();
    super.dispose();
  }

  void _syncControllers(Profile? profile) {
    if (profile == null) return;
    if (identical(profile, _syncedProfile)) return;
    if (_fullNameController.text != (profile.fullName ?? '')) {
      _fullNameController.text = profile.fullName ?? '';
    }
    if (_phoneController.text != (profile.phoneNumber ?? '')) {
      _phoneController.text = profile.phoneNumber ?? '';
    }
    if (_summaryController.text != (profile.summary ?? '')) {
      _summaryController.text = profile.summary ?? '';
    }
    _syncedProfile = profile;
  }

  Future<void> _saveProfile(ProfileProvider provider) async {
    final profile = provider.profile;
    if (profile == null) return;
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSavingProfile = true);

    final updatedProfile = Profile(
      userId: profile.userId,
      fullName: _fullNameController.text.trim(),
      phoneNumber: _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
      summary: _summaryController.text.trim().isEmpty ? null : _summaryController.text.trim(),
    );

    final success = await provider.updateMyProfile(updatedProfile);
    if (!mounted) return;

    setState(() => _isSavingProfile = false);

    final message = success ? 'Profile updated successfully' : (provider.error ?? 'Failed to update profile');
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _uploadCv(ProfileProvider provider) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      withData: kIsWeb,
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'doc', 'docx'],
    );

    if (result == null) return;

    final versionName = await _promptForVersionName(
      title: 'Upload CV',
      hint: 'e.g. Senior Android Engineer CV',
    );
    if (versionName == null) return;

    final file = result.files.first;
    if (file.path == null && file.bytes == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to read the selected file.')),
      );
      return;
    }

    setState(() => _isUploadingCv = true);

    final success = await provider.uploadCv(
      versionName: versionName,
      filePath: file.path,
      fileBytes: file.bytes,
      fileName: file.name,
    );

    if (!mounted) return;

    setState(() => _isUploadingCv = false);
    final message = success ? 'CV uploaded successfully' : (provider.error ?? 'Failed to upload CV');
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _generateCv(ProfileProvider provider) async {
    final versionName = await _promptForVersionName(
      title: 'Generate CV from profile',
      hint: 'e.g. Product Designer CV',
    );
    if (versionName == null) return;

    setState(() => _isGeneratingCv = true);
    final success = await provider.generateCv(versionName);
    if (!mounted) return;

    setState(() => _isGeneratingCv = false);
    final message = success ? 'CV generated successfully' : (provider.error ?? 'Failed to generate CV');
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _downloadCv(ProfileProvider provider, Cv cv) async {
    final fileId = cv.fileId;
    if (fileId == null || fileId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This CV is not associated with a downloadable file yet.')),
      );
      return;
    }

    setState(() => _downloadingFileId = fileId);
    try {
      final location = await provider.downloadCv(cv);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Downloaded to ')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) {
        setState(() => _downloadingFileId = null);
      }
    }
  }

  Future<String?> _promptForVersionName({required String title, required String hint}) {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(title),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(
              labelText: 'Version name',
              hintText: hint,
              border: const OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final value = controller.text.trim();
                Navigator.of(dialogContext).pop(
                  value.isEmpty ? null : value,
                );
              },
              child: const Text('Continue'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProfileProvider>(
      builder: (context, provider, _) {
        final profile = provider.profile;

        if (provider.isLoading && profile == null) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && profile == null) {
          return Center(
            child: EmptyState(
              icon: Icons.warning_amber_outlined,
              title: 'Unable to load profile',
              subtitle: provider.error!,
              action: OutlinedButton.icon(
                onPressed: provider.fetchMyProfile,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Retry'),
              ),
            ),
          );
        }

        if (profile == null) {
          return const Center(
            child: EmptyState(
              icon: Icons.person_outline,
              title: 'Profile not available',
              subtitle: 'Complete the onboarding flow to view and edit your profile.',
            ),
          );
        }

        _syncControllers(profile);

        final experiences = profile.experiences;
        final education = profile.education;
        final skills = profile.skills;
        final cvs = profile.cvs;

        return RefreshIndicator(
          onRefresh: provider.fetchMyProfile,
          displacement: 40,
          child: Scrollbar(
            interactive: true,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate(
                      [
                        _ProfileHeader(
                          fullName: profile.fullName ?? '',
                          email: provider.authProvider.user?.email ?? '',
                          summary: profile.summary ?? '',
                        ),
                        const SizedBox(height: 16),
                        _ProfileStatsBar(
                          experiences: experiences.length,
                          education: education.length,
                          skills: skills.length,
                          cvs: cvs.length,
                        ),
                        const SizedBox(height: 24),
                        _buildBasicsCard(provider),
                        const SizedBox(height: 24),
                        if (experiences.isNotEmpty) ...[
                          SectionHeader(
                            title: 'Experience',
                            subtitle: 'Highlight roles that show your progression and impact.',
                          ),
                          const SizedBox(height: 12),
                          ...experiences.map((experience) => _ExperienceTile(experience)),
                          const SizedBox(height: 24),
                        ] else ...[
                          SectionHeader(
                            title: 'Experience',
                            subtitle: 'Add roles to help recruiters understand your journey.',
                          ),
                          const SizedBox(height: 12),
                          _PlaceholderCard(
                            icon: Icons.work_outline,
                            message: 'No experience added yet. Keep your profile updated for faster review.',
                          ),
                          const SizedBox(height: 24),
                        ],
                        if (education.isNotEmpty) ...[
                          SectionHeader(
                            title: 'Education',
                            subtitle: 'Your academic achievements and certifications.',
                          ),
                          const SizedBox(height: 12),
                          ...education.map((education) => _EducationTile(education)),
                          const SizedBox(height: 24),
                        ] else ...[
                          SectionHeader(
                            title: 'Education',
                            subtitle: 'Showcase your degrees or relevant certifications.',
                          ),
                          const SizedBox(height: 12),
                          _PlaceholderCard(
                            icon: Icons.school_outlined,
                            message: 'Add schooling or certifications to round out your profile.',
                          ),
                          const SizedBox(height: 24),
                        ],
                        SectionHeader(
                          title: 'Skills',
                          subtitle: 'We surface your skills in job recommendations and searches.',
                        ),
                        const SizedBox(height: 12),
                        if (skills.isEmpty)
                          _PlaceholderCard(
                            icon: Icons.bolt_outlined,
                            message: 'Tag your top skills so recruiters can match you with the right opportunities.',
                          )
                        else
                          Wrap(
                            spacing: 10,
                            runSpacing: 10,
                            children: skills
                                .map(
                                  (skill) => Chip(
                                    label: Text(skill.name),
                                    avatar: const Icon(Icons.check_circle_outline, size: 16),
                                  ),
                                )
                                .toList(),
                          ),
                        const SizedBox(height: 24),
                        SectionHeader(
                          title: 'CV library',
                          subtitle: 'Manage the documents you want to share with hiring teams.',
                        ),
                        const SizedBox(height: 12),
                        _buildCvActions(provider),
                        const SizedBox(height: 16),
                        if (cvs.isEmpty)
                          _PlaceholderCard(
                            icon: Icons.description_outlined,
                            message: 'Upload or generate a CV to quickly apply for roles.',
                          )
                        else
                          ...cvs.map(
                            (cv) => _CvTile(
                              cv: cv,
                              isDownloading: _downloadingFileId == cv.fileId,
                              onDownload: () => _downloadCv(provider, cv),
                            ),
                          ),
                        const SizedBox(height: 36),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBasicsCard(ProfileProvider provider) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 0,
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Basic information',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              Text(
                'Keep this section current to ensure teams can reach you quickly.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _fullNameController,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Full name',
                  hintText: 'How should employers address you?',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Your name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                textInputAction: TextInputAction.next,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone number',
                  hintText: 'Optional � Include country code for international roles',
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _summaryController,
                minLines: 3,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Professional summary',
                  hintText: 'Share your motivation, achievements, and what you\'re looking for next.',
                ),
              ),
              const SizedBox(height: 24),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton.icon(
                  onPressed: _isSavingProfile ? null : () => _saveProfile(provider),
                  icon: _isSavingProfile
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.save_outlined),
                  label: Text(_isSavingProfile ? 'Saving...' : 'Save changes'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCvActions(ProfileProvider provider) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        FilledButton.icon(
          onPressed: _isUploadingCv ? null : () => _uploadCv(provider),
          icon: _isUploadingCv
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.upload_file_outlined),
          label: Text(_isUploadingCv ? 'Uploading...' : 'Upload CV'),
        ),
        OutlinedButton.icon(
          onPressed: _isGeneratingCv ? null : () => _generateCv(provider),
          icon: _isGeneratingCv
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.auto_awesome_outlined),
          label: Text(_isGeneratingCv ? 'Generating...' : 'Generate from profile'),
        ),
      ],
    );
  }

  String? _formatDateRange(DateTime? start, DateTime? end) {
    if (start == null && end == null) return null;
    final startLabel = start != null ? _monthYearFormat.format(start) : null;
    final endLabel = end != null ? _monthYearFormat.format(end) : 'Present';
    if (startLabel != null) {
      return ' � ';
    }
    return endLabel;
  }

  String? _formatCvTimestamp(DateTime? value) {
    if (value == null) return null;
    return _cvTimestampFormat.format(value.toLocal());
  }

  Widget _CvTile({required Cv cv, required bool isDownloading, required VoidCallback onDownload}) {
    final timestamp = _formatCvTimestamp(cv.createdAt);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 14,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 46,
                width: 46,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.12),
                ),
                child: Icon(
                  cv.isDefault ? Icons.star_rounded : Icons.description_outlined,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            cv.versionName,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                        if (cv.isDefault)
                          Chip(
                            label: const Text('Default'),
                            backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                            labelStyle: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                      ],
                    ),
                    if (timestamp != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        'Created ',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: OutlinedButton.icon(
                        onPressed: isDownloading ? null : onDownload,
                        icon: isDownloading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.download_rounded),
                        label: Text(isDownloading ? 'Downloading...' : 'Download'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _PlaceholderCard({required IconData icon, required String message}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _ExperienceTile(Experience experience) {
    final dateRange = _formatDateRange(experience.startDate, experience.endDate);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 18,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                experience.title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                experience.companyName,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
              ),
              if (dateRange != null) ...[
                const SizedBox(height: 6),
                Text(
                  dateRange,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
              if ((experience.description ?? '').isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  experience.description!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _EducationTile(Education education) {
    final dateRange = _formatDateRange(education.startDate, education.endDate);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 18,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                education.school,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(
                education.degree,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
              ),
              if (dateRange != null) ...[
                const SizedBox(height: 6),
                Text(
                  dateRange,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.fullName,
    required this.email,
    required this.summary,
  });

  final String fullName;
  final String email;
  final String summary;

  @override
  Widget build(BuildContext context) {
    final initials = fullName.trim().isEmpty
        ? 'YOU'
        : fullName
            .trim()
            .split(' ')
            .take(2)
            .map((part) => part.isNotEmpty ? part[0] : '')
            .join()
            .toUpperCase();

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).colorScheme.primary.withOpacity(0.9),
            Theme.of(context).colorScheme.secondary.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(
                  initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 16),
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
                    const SizedBox(height: 4),
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
          const SizedBox(height: 20),
          Text(
            summary.isEmpty
                ? 'Tell recruiters about your experience, what you excel at, and the roles you\'re excited about next.'
                : summary,
            style: TextStyle(
              color: Colors.white.withOpacity(0.92),
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileStatsBar extends StatelessWidget {
  const _ProfileStatsBar({
    required this.experiences,
    required this.education,
    required this.skills,
    required this.cvs,
  });

  final int experiences;
  final int education;
  final int skills;
  final int cvs;

  @override
  Widget build(BuildContext context) {
    final stats = [
      _QuickStat(
        icon: Icons.timeline_outlined,
        label: 'Experience entries',
        value: experiences,
        color: Theme.of(context).colorScheme.primary,
      ),
      _QuickStat(
        icon: Icons.school_outlined,
        label: 'Education records',
        value: education,
        color: const Color(0xFF6366F1),
      ),
      _QuickStat(
        icon: Icons.bolt_outlined,
        label: 'Skill tags',
        value: skills,
        color: const Color(0xFF0EA5E9),
      ),
      _QuickStat(
        icon: Icons.description_outlined,
        label: 'CV versions',
        value: cvs,
        color: const Color(0xFFF97316),
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 900;
        final cardWidth = isWide ? (constraints.maxWidth - 36) / 4 : constraints.maxWidth;
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: stats
              .map(
                (stat) => SizedBox(
                  width: cardWidth,
                  child: _QuickStatTile(stat: stat),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class _QuickStat {
  const _QuickStat({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final int value;
  final Color color;
}

class _QuickStatTile extends StatelessWidget {
  const _QuickStatTile({required this.stat});

  final _QuickStat stat;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      decoration: BoxDecoration(
        color: stat.color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(stat.icon, color: stat.color),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                stat.value.toString(),
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: stat.color,
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                stat.label,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/cv.dart';
import '../../models/education.dart';
import '../../models/experience.dart';
import '../../models/profile.dart';
import '../../models/skill.dart';
import '../../providers/recruiter_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';

class CandidateProfileScreen extends StatefulWidget {
  const CandidateProfileScreen({super.key, required this.candidateId});

  final int candidateId;

  @override
  State<CandidateProfileScreen> createState() => _CandidateProfileScreenState();
}

class _CandidateProfileScreenState extends State<CandidateProfileScreen> {
  final DateFormat _monthYearFormat = DateFormat('MMM yyyy');
  final DateFormat _cvTimestampFormat = DateFormat('MMM d, yyyy • HH:mm');
  String? _downloadingFileId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RecruiterProvider>().fetchCandidateProfile(widget.candidateId);
    });
  }

  Future<void> _refresh(RecruiterProvider provider) {
    return provider.fetchCandidateProfile(widget.candidateId);
  }

  Future<void> _downloadCv(RecruiterProvider provider, Cv cv) async {
    final fileId = cv.fileId;
    if (fileId == null || fileId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This CV does not have a downloadable file.')),
      );
      return;
    }

    setState(() => _downloadingFileId = fileId);
    try {
      final path = await provider.downloadCandidateCv(cv);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('CV downloaded to ')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to download CV: ')),
      );
    } finally {
      if (mounted) {
        setState(() => _downloadingFileId = null);
      }
    }
  }

  String? _formatDateRange(DateTime? start, DateTime? end) {
    if (start == null && end == null) return null;
    final startLabel = start != null ? _monthYearFormat.format(start) : null;
    final endLabel = end != null ? _monthYearFormat.format(end) : 'Present';
    if (startLabel != null) {
      return ' – ';
    }
    return endLabel;
  }

  String? _formatCvTimestamp(DateTime? timestamp) {
    if (timestamp == null) return null;
    return _cvTimestampFormat.format(timestamp.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Candidate profile'),
        actions: [
          Consumer<RecruiterProvider>(
            builder: (context, provider, _) {
              return IconButton(
                icon: provider.isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh_rounded),
                tooltip: 'Refresh profile',
                onPressed: provider.isLoading ? null : () => provider.fetchCandidateProfile(widget.candidateId),
              );
            },
          ),
        ],
      ),
      body: Consumer<RecruiterProvider>(
        builder: (context, provider, _) {
          final profile = provider.viewingCandidateProfile;

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
                  onPressed: () => provider.fetchCandidateProfile(widget.candidateId),
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
                subtitle: 'This candidate has not completed their profile yet.',
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _refresh(provider),
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
                          _CandidateHeader(profile: profile, applicationCount: provider.applicationsForJob.length),
                          const SizedBox(height: 24),
                          if ((profile.summary ?? '').isNotEmpty) ...[
                            SectionHeader(
                              title: 'Summary',
                              subtitle: 'How this candidate positions themselves for new opportunities.',
                            ),
                            const SizedBox(height: 12),
                            Text(
                              profile.summary!,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            const SizedBox(height: 24),
                          ],
                          _buildExperienceSection(profile.experiences),
                          const SizedBox(height: 24),
                          _buildEducationSection(profile.education),
                          const SizedBox(height: 24),
                          _buildSkillsSection(profile.skills),
                          const SizedBox(height: 24),
                          SectionHeader(
                            title: 'CV library',
                            subtitle: 'Download the materials the candidate supplied.',
                          ),
                          const SizedBox(height: 12),
                          if (profile.cvs.isEmpty)
                            const _PlaceholderCard(
                              icon: Icons.description_outlined,
                              message: 'No CVs available yet from this candidate.',
                            )
                          else
                            ...profile.cvs.map(
                              (cv) => _CvTile(
                                cv: cv,
                                isDownloading: _downloadingFileId == cv.fileId,
                                formattedTimestamp: _formatCvTimestamp(cv.createdAt),
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
      ),
    );
  }

  Widget _buildExperienceSection(List<Experience> experiences) {
    if (experiences.isEmpty) {
      return const _PlaceholderCard(
        icon: Icons.work_outline,
        message: 'No experience records yet. Encourage the candidate to update their profile.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Experience',
          subtitle: 'Key roles and achievements shared by the candidate.',
        ),
        const SizedBox(height: 12),
        ...experiences.map((experience) {
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
        }),
      ],
    );
  }

  Widget _buildEducationSection(List<Education> education) {
    if (education.isEmpty) {
      return const _PlaceholderCard(
        icon: Icons.school_outlined,
        message: 'No education details shared.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Education',
          subtitle: 'Academic background supplied by the candidate.',
        ),
        const SizedBox(height: 12),
        ...education.map((entry) {
          final dateRange = _formatDateRange(entry.startDate, entry.endDate);
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
                      entry.school,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      entry.degree,
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
        }),
      ],
    );
  }

  Widget _buildSkillsSection(List<Skill> skills) {
    if (skills.isEmpty) {
      return const _PlaceholderCard(
        icon: Icons.bolt_outlined,
        message: 'No skills were listed for this candidate.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Skills',
          subtitle: 'Capabilities the candidate chose to highlight.',
        ),
        const SizedBox(height: 12),
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
      ],
    );
  }
}

class _CandidateHeader extends StatelessWidget {
  const _CandidateHeader({required this.profile, required this.applicationCount});

  final Profile profile;
  final int applicationCount;

  @override
  Widget build(BuildContext context) {
    final fullName = profile.fullName ?? 'Candidate';
    final initials = fullName
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
            Theme.of(context).colorScheme.secondary.withOpacity(0.75),
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
                  initials.isEmpty ? 'C' : initials,
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
                      fullName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Phone ',
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
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              Chip(
                avatar: const Icon(Icons.apps_outlined, size: 16),
                label: Text(' application'),
              ),
              Chip(
                avatar: const Icon(Icons.check_circle_outline, size: 16),
                label: Text(' CV uploaded'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CvTile extends StatelessWidget {
  const _CvTile({
    required this.cv,
    required this.isDownloading,
    required this.formattedTimestamp,
    required this.onDownload,
  });

  final Cv cv;
  final bool isDownloading;
  final String? formattedTimestamp;
  final VoidCallback onDownload;

  @override
  Widget build(BuildContext context) {
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
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
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
                    if (formattedTimestamp != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        'Uploaded ',
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
}

class _PlaceholderCard extends StatelessWidget {
  const _PlaceholderCard({required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
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
}

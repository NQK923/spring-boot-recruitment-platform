import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../models/application.dart';
import '../../models/application_note.dart';
import '../../providers/recruiter_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';
import './candidate_profile_screen.dart';
import './schedule_interview_screen.dart';

class CandidateListScreen extends StatefulWidget {
  const CandidateListScreen({super.key, required this.jobId, required this.jobTitle});

  final int jobId;
  final String jobTitle;

  @override
  State<CandidateListScreen> createState() => _CandidateListScreenState();
}

class _CandidateListScreenState extends State<CandidateListScreen> {
  static const List<String> _statuses = [
    'APPLIED',
    'SCREENING',
    'INTERVIEWING',
    'OFFERED',
    'HIRED',
    'REJECTED',
  ];

  final Set<int> _updatingStatusIds = <int>{};
  final DateFormat _dateFormat = DateFormat('MMM d, yyyy');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RecruiterProvider>().fetchApplicationsForJob(widget.jobId);
    });
  }

  Future<void> _refresh(RecruiterProvider provider) {
    return provider.fetchApplicationsForJob(widget.jobId);
  }

  Future<void> _changeStatus(RecruiterProvider provider, Application application, String status) async {
    if (_updatingStatusIds.contains(application.id)) return;
    setState(() => _updatingStatusIds.add(application.id));
    final success = await provider.updateApplicationStatus(application.id, status);
    if (!mounted) return;
    setState(() => _updatingStatusIds.remove(application.id));
    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update application status')),
      );
    }
  }

  Future<void> _showNotesSheet(RecruiterProvider provider, Application application) async {
    await provider.fetchNotesForApplication(application.id);
    if (!context.mounted) return;

    final noteController = TextEditingController();
    final candidateLabel = application.candidateName ?? 'candidate #';

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        bool isSubmittingNote = false;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return DraggableScrollableSheet(
              expand: false,
              maxChildSize: 0.9,
              initialChildSize: 0.7,
              builder: (context, scrollController) {
                return Padding(
                  padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
                  child: Consumer<RecruiterProvider>(
                    builder: (context, recruiter, _) {
                      final notes = recruiter.notesForApplication(application.id);
                      final isLoading = recruiter.isNotesLoading;
                      final error = recruiter.notesError;

                      return ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  'Notes for $candidateLabel',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close),
                                onPressed: () => Navigator.of(context).pop(),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (isLoading)
                            const Center(child: CircularProgressIndicator())
                          else if (error != null && notes.isEmpty)
                            _NotesPlaceholder(
                              icon: Icons.warning_amber_outlined,
                              message: error,
                            )
                          else if (notes.isEmpty)
                            const _NotesPlaceholder(
                              icon: Icons.note_alt_outlined,
                              message: 'No notes yet. Add the first one below to share context with your team.',
                            )
                          else
                            ...notes.map((note) => _NoteTile(note: note)),
                          const SizedBox(height: 24),
                          TextField(
                            controller: noteController,
                            minLines: 2,
                            maxLines: 4,
                            decoration: const InputDecoration(
                              labelText: 'Add a note',
                              hintText: 'Share interview impressions or next steps',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Align(
                            alignment: Alignment.centerRight,
                            child: FilledButton.icon(
                              onPressed: isSubmittingNote
                                  ? null
                                  : () async {
                                      final text = noteController.text.trim();
                                      if (text.isEmpty) return;
                                      setModalState(() => isSubmittingNote = true);
                                      final success = await recruiter.addNoteToApplication(application.id, text);
                                      if (!context.mounted) return;
                                      if (success) {
                                        noteController.clear();
                                      } else {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text(recruiter.notesError ?? 'Failed to add note')),
                                        );
                                      }
                                      setModalState(() => isSubmittingNote = false);
                                    },
                              icon: isSubmittingNote
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.add_comment_outlined),
                              label: Text(isSubmittingNote ? 'Saving...' : 'Save note'),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                );
              },
            );
          },
        );
      },
    );

    noteController.dispose();
  }

  void _openSchedule(Application application) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ScheduleInterviewScreen(
          applicationId: application.id,
          candidateId: application.candidateId,
        ),
      ),
    );
  }

  void _openProfile(Application application) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CandidateProfileScreen(candidateId: application.candidateId),
      ),
    );
  }

  Color _statusColor(String status, ThemeData theme) {
    final normalized = status.toUpperCase();
    switch (normalized) {
      case 'APPLIED':
        return theme.colorScheme.primary;
      case 'SCREENING':
        return const Color(0xFF6366F1);
      case 'INTERVIEWING':
        return const Color(0xFF0EA5E9);
      case 'OFFERED':
        return const Color(0xFFF97316);
      case 'HIRED':
        return const Color(0xFF16A34A);
      case 'REJECTED':
        return const Color(0xFFDC2626);
      default:
        return theme.colorScheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Applicants for ${widget.jobTitle}'),
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
                onPressed: provider.isLoading ? null : () => provider.fetchApplicationsForJob(widget.jobId),
                tooltip: 'Refresh applicants',
              );
            },
          ),
        ],
      ),
      body: Consumer<RecruiterProvider>(
        builder: (context, provider, _) {
          final applications = provider.applicationsForJob;

          if (provider.isLoading && applications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null && applications.isEmpty) {
            return Center(
              child: EmptyState(
                icon: Icons.warning_amber_outlined,
                title: 'Unable to load applicants',
                subtitle: provider.error!,
                action: OutlinedButton.icon(
                  onPressed: () => provider.fetchApplicationsForJob(widget.jobId),
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Retry'),
                ),
              ),
            );
          }

          if (applications.isEmpty) {
            return const Center(
              child: EmptyState(
                icon: Icons.people_outline,
                title: 'No applicants yet',
                subtitle: 'Share the posting or check back later for new submissions.',
              ),
            );
          }

          final summary = _buildStatusSummary(applications);

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
                          SectionHeader(
                            title: ' applicant',
                            subtitle: 'Track pipeline progress and collaborate with your hiring team.',
                          ),
                          const SizedBox(height: 16),
                          _StatusSummaryBar(summary: summary),
                          const SizedBox(height: 24),
                          ...applications.map(
                            (application) => _ApplicantCard(
                              application: application,
                              isUpdatingStatus: _updatingStatusIds.contains(application.id),
                              statusColor: _statusColor(application.status, Theme.of(context)),
                              formattedDate: _dateFormat.format(application.appliedAt.toLocal()),
                              onChangeStatus: (next) => _changeStatus(provider, application, next),
                              onOpenNotes: () => _showNotesSheet(provider, application),
                              onOpenProfile: () => _openProfile(application),
                              onScheduleInterview: () => _openSchedule(application),
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

  Map<String, int> _buildStatusSummary(List<Application> applications) {
    final Map<String, int> summary = {for (final status in _statuses) status: 0};
    for (final application in applications) {
      summary.update(application.status, (value) => value + 1, ifAbsent: () => 1);
    }
    return summary;
  }
}

class _ApplicantCard extends StatelessWidget {
  const _ApplicantCard({
    required this.application,
    required this.isUpdatingStatus,
    required this.statusColor,
    required this.formattedDate,
    required this.onChangeStatus,
    required this.onOpenNotes,
    required this.onOpenProfile,
    required this.onScheduleInterview,
  });

  final Application application;
  final bool isUpdatingStatus;
  final Color statusColor;
  final String formattedDate;
  final ValueChanged<String> onChangeStatus;
  final VoidCallback onOpenNotes;
  final VoidCallback onOpenProfile;
  final VoidCallback onScheduleInterview;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final candidateName = application.candidateName ?? 'Candidate #';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: statusColor.withOpacity(0.15),
                    child: Text(
                      candidateName.substring(0, 1).toUpperCase(),
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          candidateName,
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Applied ',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  PopupMenuButton<String>(
                    tooltip: 'Change status',
                    onSelected: onChangeStatus,
                    itemBuilder: (context) => _CandidateListScreenState._statuses
                        .map(
                          (status) => PopupMenuItem<String>(
                            value: status,
                            child: Text(status),
                          ),
                        )
                        .toList(),
                    child: Chip(
                      avatar: isUpdatingStatus
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.change_circle_outlined, size: 16),
                      label: Text(application.status),
                      backgroundColor: statusColor.withOpacity(0.15),
                      labelStyle: theme.textTheme.bodySmall?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  OutlinedButton.icon(
                    onPressed: onOpenProfile,
                    icon: const Icon(Icons.person_outline),
                    label: const Text('View profile'),
                  ),
                  OutlinedButton.icon(
                    onPressed: onScheduleInterview,
                    icon: const Icon(Icons.calendar_month_outlined),
                    label: const Text('Schedule interview'),
                  ),
                  OutlinedButton.icon(
                    onPressed: onOpenNotes,
                    icon: const Icon(Icons.sticky_note_2_outlined),
                    label: const Text('Notes'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusSummaryBar extends StatelessWidget {
  const _StatusSummaryBar({required this.summary});

  final Map<String, int> summary;

  @override
  Widget build(BuildContext context) {
    final visibleEntries = summary.entries.where((entry) => entry.value > 0).toList();
    if (visibleEntries.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.timeline_outlined, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Text(
              'All candidates are awaiting review',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
          ],
        ),
      );
    }

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: visibleEntries
          .map(
            (entry) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.06),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.timeline_outlined, size: 18, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(width: 10),
                  Text(
                    ' • ',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _NoteTile extends StatelessWidget {
  const _NoteTile({required this.note});

  final ApplicationNote note;

  @override
  Widget build(BuildContext context) {
    final createdLabel = DateFormat('MMM d • HH:mm').format(note.createdAt.toLocal());
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(note.content, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 8),
          Text(
            'by # • ',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _NotesPlaceholder extends StatelessWidget {
  const _NotesPlaceholder({required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
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

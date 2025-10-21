import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/job.dart';
import '../../providers/job_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';
import './job_detail_screen.dart';

enum _JobQuickFilter { activeOnly, remoteFriendly, leadership }

class JobListScreen extends StatefulWidget {
  const JobListScreen({super.key});

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> {
  final TextEditingController _searchController = TextEditingController();
  final Set<_JobQuickFilter> _selectedFilters = <_JobQuickFilter>{};
  String _query = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    setState(() {
      _query = _searchController.text.trim().toLowerCase();
    });
  }

  @override
  void dispose() {
    _searchController
      ..removeListener(_onSearchChanged)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<JobProvider>(
      builder: (context, jobProvider, _) {
        if (jobProvider.isLoading && jobProvider.jobs.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (jobProvider.error != null && jobProvider.jobs.isEmpty) {
          return Center(
            child: EmptyState(
              icon: Icons.error_outline,
              title: 'Unable to load jobs',
              subtitle: jobProvider.error!,
              action: OutlinedButton.icon(
                onPressed: jobProvider.fetchPublicJobs,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ),
          );
        }

        final filteredJobs = _filterJobs(jobProvider.jobs);

        if (filteredJobs.isEmpty) {
          return Center(
            child: EmptyState(
              icon: Icons.search_off_rounded,
              title: 'No matching roles',
              subtitle:
                  'Adjust your keywords or filters to discover more opportunities that match your preferences.',
              action: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _query = '';
                    _searchController.clear();
                    _selectedFilters.clear();
                  });
                },
                child: const Text('Clear filters'),
              ),
            ),
          );
        }

        final activeCount = jobProvider.jobs.where(_isActiveJob).length;
        final remoteCount = jobProvider.jobs.where(_isRemoteFriendly).length;

        return RefreshIndicator(
          displacement: 40,
          color: theme.colorScheme.primary,
          onRefresh: jobProvider.fetchPublicJobs,
          child: Scrollbar(
            interactive: true,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 8),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate(
                      [
                        _buildSearchField(theme),
                        const SizedBox(height: 18),
                        _buildQuickFilters(theme),
                        const SizedBox(height: 24),
                        _buildSummaryStats(
                          theme,
                          totalCount: jobProvider.jobs.length,
                          activeCount: activeCount,
                          remoteCount: remoteCount,
                        ),
                        const SizedBox(height: 24),
                        SectionHeader(
                          title: _query.isEmpty ? 'Recommended roles' : 'Search results',
                          subtitle: _query.isEmpty
                              ? 'Browse through curated opportunities aligned with your interests.'
                              : 'Showing ${filteredJobs.length} role${filteredJobs.length == 1 ? '' : 's'} for "$_query"',
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final job = filteredJobs[index];
                        return _JobCard(job: job);
                      },
                      childCount: filteredJobs.length,
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 48)),
              ],
            ),
          ),
        );
      },
    );
  }

  List<Job> _filterJobs(List<Job> jobs) {
    Iterable<Job> filtered = jobs;

    if (_query.isNotEmpty) {
      filtered = filtered.where(
        (job) =>
            job.title.toLowerCase().contains(_query) ||
            job.description.toLowerCase().contains(_query),
      );
    }

    if (_selectedFilters.contains(_JobQuickFilter.activeOnly)) {
      filtered = filtered.where(_isActiveJob);
    }
    if (_selectedFilters.contains(_JobQuickFilter.remoteFriendly)) {
      filtered = filtered.where(_isRemoteFriendly);
    }
    if (_selectedFilters.contains(_JobQuickFilter.leadership)) {
      filtered = filtered.where(
        (job) => job.title.toLowerCase().contains('lead') || job.title.toLowerCase().contains('manager'),
      );
    }

    return filtered.toList();
  }

  bool _isActiveJob(Job job) {
    final status = job.status.toLowerCase();
    return status == 'active' || status == 'open' || status == 'published';
  }

  bool _isRemoteFriendly(Job job) {
    final description = job.description.toLowerCase();
    return description.contains('remote') ||
        description.contains('hybrid') ||
        description.contains('work from home');
  }

  Widget _buildSearchField(ThemeData theme) {
    return TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'Search by title, keywords or description',
        prefixIcon: Icon(Icons.search_rounded, color: theme.colorScheme.primary),
        suffixIcon: _query.isEmpty
            ? null
            : IconButton(
                tooltip: 'Clear search',
                onPressed: () {
                  _searchController.clear();
                  setState(() {
                    _query = '';
                  });
                },
                icon: const Icon(Icons.close_rounded),
              ),
      ),
      textInputAction: TextInputAction.search,
    );
  }

  Widget _buildQuickFilters(ThemeData theme) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        _FilterChip(
          label: 'Active only',
          icon: Icons.flash_on_rounded,
          selected: _selectedFilters.contains(_JobQuickFilter.activeOnly),
          onSelected: (value) {
            setState(() {
              if (value) {
                _selectedFilters.add(_JobQuickFilter.activeOnly);
              } else {
                _selectedFilters.remove(_JobQuickFilter.activeOnly);
              }
            });
          },
        ),
        _FilterChip(
          label: 'Remote friendly',
          icon: Icons.public_rounded,
          selected: _selectedFilters.contains(_JobQuickFilter.remoteFriendly),
          onSelected: (value) {
            setState(() {
              if (value) {
                _selectedFilters.add(_JobQuickFilter.remoteFriendly);
              } else {
                _selectedFilters.remove(_JobQuickFilter.remoteFriendly);
              }
            });
          },
        ),
        _FilterChip(
          label: 'Leadership roles',
          icon: Icons.military_tech_rounded,
          selected: _selectedFilters.contains(_JobQuickFilter.leadership),
          onSelected: (value) {
            setState(() {
              if (value) {
                _selectedFilters.add(_JobQuickFilter.leadership);
              } else {
                _selectedFilters.remove(_JobQuickFilter.leadership);
              }
            });
          },
        ),
      ],
    );
  }

  Widget _buildSummaryStats(
    ThemeData theme, {
    required int totalCount,
    required int activeCount,
    required int remoteCount,
  }) {
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    Widget buildTile({
      required IconData icon,
      required String label,
      required String value,
      Color? color,
    }) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        decoration: BoxDecoration(
          color: (color ?? colorScheme.primary).withOpacity(0.07),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Icon(icon, color: color ?? colorScheme.primary),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: color ?? colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: textTheme.bodySmall,
                ),
              ],
            ),
          ],
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 720;
        return Wrap(
          spacing: 16,
          runSpacing: 12,
          children: [
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildTile(
                icon: Icons.business_center_outlined,
                label: 'Total roles published',
                value: '$totalCount',
              ),
            ),
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildTile(
                icon: Icons.visibility_outlined,
                label: 'Actively hiring',
                value: '$activeCount',
                color: const Color(0xFF3B82F6),
              ),
            ),
            SizedBox(
              width: isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth,
              child: buildTile(
                icon: Icons.cloud_outlined,
                label: 'Remote friendly roles',
                value: '$remoteCount',
                color: const Color(0xFF10B981),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job});

  final Job job;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final subtitleColor = theme.textTheme.bodySmall?.color?.withOpacity(0.75) ?? Colors.grey;
    final isActive = job.status.toUpperCase() == 'ACTIVE' || job.status.toUpperCase() == 'OPEN';
    final isRemote = job.description.toLowerCase().contains('remote');

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (ctx) => JobDetailScreen(job: job),
            ),
          );
        },
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                offset: const Offset(0, 8),
                blurRadius: 18,
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      height: 48,
                      width: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: theme.colorScheme.primary.withOpacity(0.12),
                      ),
                      child: Icon(
                        Icons.work_outline_rounded,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Job ID: ${job.id}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: subtitleColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(
                                isActive ? Icons.check_circle_rounded : Icons.timelapse_rounded,
                                size: 16,
                                color: isActive
                                    ? const Color(0xFF16A34A)
                                    : theme.colorScheme.primary.withOpacity(0.8),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isActive ? 'Actively hiring' : 'Pipeline preview',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: isActive
                                      ? const Color(0xFF16A34A)
                                      : theme.colorScheme.primary.withOpacity(0.8),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.open_in_new_rounded,
                      color: theme.colorScheme.primary,
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  job.description,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 10,
                  runSpacing: 6,
                  children: [
                    _JobTag(label: job.status.toUpperCase()),
                    if (isRemote) const _JobTag(label: 'Remote friendly'),
                    const _JobTag(label: 'Inclusive team'),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final ValueChanged<bool> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return FilterChip(
      label: Text(label),
      avatar: Icon(
        icon,
        size: 18,
        color: selected ? Colors.white : theme.colorScheme.primary,
      ),
      selected: selected,
      onSelected: onSelected,
      showCheckmark: false,
      selectedColor: theme.colorScheme.primary,
      labelStyle: TextStyle(
        color: selected ? Colors.white : theme.colorScheme.primary,
        fontWeight: FontWeight.w600,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      side: BorderSide(
        color: selected
            ? theme.colorScheme.primary
            : theme.colorScheme.primary.withOpacity(0.16),
      ),
      backgroundColor: theme.colorScheme.primary.withOpacity(0.06),
    );
  }
}

class _JobTag extends StatelessWidget {
  const _JobTag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

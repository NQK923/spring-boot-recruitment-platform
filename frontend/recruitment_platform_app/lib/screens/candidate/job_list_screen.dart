import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/job.dart';
import '../../providers/job_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';
import './job_detail_screen.dart';

class JobListScreen extends StatefulWidget {
  const JobListScreen({super.key});

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> {
  final TextEditingController _searchController = TextEditingController();
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore Opportunities'),
      ),
      body: Consumer<JobProvider>(
        builder: (context, jobProvider, child) {
          if (jobProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (jobProvider.error != null) {
            return EmptyState(
              icon: Icons.error_outline,
              title: 'Unable to load jobs',
              subtitle: jobProvider.error!,
              action: OutlinedButton.icon(
                onPressed: jobProvider.fetchPublicJobs,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            );
          }

          final filteredJobs = _filterJobs(jobProvider.jobs);

          if (filteredJobs.isEmpty) {
            return EmptyState(
              icon: Icons.search_off_rounded,
              title: 'No matching roles',
              subtitle: 'Try adjusting your search keywords to discover more positions.',
            );
          }

          return RefreshIndicator(
            onRefresh: jobProvider.fetchPublicJobs,
            displacement: 30,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              children: [
                _buildSearchField(theme),
                const SizedBox(height: 20),
                SectionHeader(
                  title: 'Recommended roles',
                  subtitle: _query.isEmpty
                      ? 'Browse through the latest openings tailored for you.'
                      : 'Showing ${filteredJobs.length} result${filteredJobs.length == 1 ? '' : 's'} for \"$_query\"',
                ),
                const SizedBox(height: 12),
                ...filteredJobs.map(_buildJobCard),
              ],
            ),
          );
        },
      ),
    );
  }

  List<Job> _filterJobs(List<Job> jobs) {
    if (_query.isEmpty) {
      return jobs;
    }
    return jobs
        .where(
          (job) =>
              job.title.toLowerCase().contains(_query) ||
              job.description.toLowerCase().contains(_query),
        )
        .toList();
  }

  Widget _buildSearchField(ThemeData theme) {
    return TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'Search by title or keywords',
        prefixIcon: Icon(Icons.search, color: theme.colorScheme.primary),
        suffixIcon: _query.isEmpty
            ? null
            : IconButton(
                onPressed: () => _searchController.clear(),
                icon: const Icon(Icons.close),
              ),
      ),
    );
  }

  Widget _buildJobCard(Job job) {
    final theme = Theme.of(context);
    final subtitleColor = theme.textTheme.bodySmall?.color ?? Colors.grey;

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
                        gradient: LinearGradient(
                          colors: [
                            theme.colorScheme.primary.withOpacity(0.15),
                            theme.colorScheme.secondary.withOpacity(0.15),
                          ],
                        ),
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
                        ],
                      ),
                    ),
                    Icon(
                      Icons.chevron_right_rounded,
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
                const SizedBox(height: 16),
                Wrap(
                  spacing: 10,
                  runSpacing: 6,
                  children: const [
                    _JobTag(label: 'Full-time'),
                    _JobTag(label: 'Growth opportunities'),
                    _JobTag(label: 'Inclusive team'),
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/company.dart';
import '../../models/company_user.dart';
import '../../providers/company_admin_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/section_header.dart';

class CompanyAdminScreen extends StatefulWidget {
  const CompanyAdminScreen({super.key});

  @override
  State<CompanyAdminScreen> createState() => _CompanyAdminScreenState();
}

class _CompanyAdminScreenState extends State<CompanyAdminScreen> {
  final _companyFormKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _websiteController = TextEditingController();
  final _logoController = TextEditingController();

  Company? _syncedCompany;

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _websiteController.dispose();
    _logoController.dispose();
    super.dispose();
  }

  void _syncCompanyFields(Company? company) {
    if (company == null) return;
    if (identical(company, _syncedCompany)) return;
    if (_nameController.text != company.name) {
      _nameController.text = company.name;
    }
    if (_descriptionController.text != (company.description ?? '')) {
      _descriptionController.text = company.description ?? '';
    }
    if (_websiteController.text != (company.website ?? '')) {
      _websiteController.text = company.website ?? '';
    }
    if (_logoController.text != (company.logoUrl ?? '')) {
      _logoController.text = company.logoUrl ?? '';
    }
    _syncedCompany = company;
  }

  Future<void> _submitCompanyUpdate(CompanyAdminProvider provider) async {
    final company = provider.company;
    if (company == null) return;
    if (!_companyFormKey.currentState!.validate()) return;

    final success = await provider.updateCompany(
      name: _nameController.text.trim(),
      description: _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
      website: _websiteController.text.trim().isEmpty ? null : _websiteController.text.trim(),
      logoUrl: _logoController.text.trim().isEmpty ? null : _logoController.text.trim(),
    );

    if (!context.mounted) return;
    final message = success ? 'Company information updated' : (provider.error ?? 'Failed to update company');
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _showInviteDialog(CompanyAdminProvider provider) async {
    final company = provider.company;
    if (company == null) return;

    final formKey = GlobalKey<FormState>();
    final emailController = TextEditingController();
    String selectedRole = 'RECRUITER';
    bool submitting = false;
    String? localError;

    try {
      final result = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return StatefulBuilder(
            builder: (dialogContext, setDialogState) {
              return AlertDialog(
                title: Text('Invite teammate to '),
                content: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: emailController,
                        decoration: const InputDecoration(
                          labelText: 'Work email',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Email is required';
                          }
                          if (!value.contains('@')) {
                            return 'Enter a valid email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: selectedRole,
                        decoration: const InputDecoration(
                          labelText: 'Role to grant',
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'RECRUITER', child: Text('Recruiter')),
                          DropdownMenuItem(value: 'COMPANY_ADMIN', child: Text('Company Admin')),
                        ],
                        onChanged: submitting
                            ? null
                            : (value) {
                                if (value != null) {
                                  setDialogState(() => selectedRole = value);
                                }
                              },
                      ),
                      if (localError != null) ...[
                        const SizedBox(height: 16),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            localError!,
                            style: const TextStyle(color: Colors.redAccent),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: submitting ? null : () => Navigator.of(dialogContext).pop(false),
                    child: const Text('Cancel'),
                  ),
                  FilledButton(
                    onPressed: submitting
                        ? null
                        : () async {
                            if (!formKey.currentState!.validate()) return;
                            setDialogState(() {
                              submitting = true;
                              localError = null;
                            });
                            final success = await provider.inviteUser(
                              email: emailController.text.trim(),
                              role: selectedRole,
                            );
                            if (!context.mounted || !dialogContext.mounted) {
                              return;
                            }
                            if (success) {
                              Navigator.of(dialogContext).pop(true);
                            } else {
                              setDialogState(() {
                                submitting = false;
                                localError = provider.error ?? 'Failed to send invitation.';
                              });
                            }
                          },
                    child: submitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Send invite'),
                  ),
                ],
              );
            },
          );
        },
      );

      if (!context.mounted) return;
      if (result == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invitation email sent to ')),
        );
      }
    } finally {
      emailController.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CompanyAdminProvider>(
      builder: (context, provider, _) {
        final hasAccess = provider.authProvider.user?.hasRole('COMPANY_ADMIN') ?? false;
        if (!hasAccess) {
          return const Center(
            child: EmptyState(
              icon: Icons.security_outlined,
              title: 'Company admin access required',
              subtitle: 'Ask a company administrator to grant you access to this area.',
            ),
          );
        }

        final company = provider.company;
        if (provider.isLoading && company == null) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && company == null) {
          return Center(
            child: EmptyState(
              icon: Icons.warning_amber_outlined,
              title: 'Unable to load company',
              subtitle: provider.error!,
              action: OutlinedButton.icon(
                onPressed: provider.refresh,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Retry'),
              ),
            ),
          );
        }

        if (company == null) {
          return const Center(
            child: EmptyState(
              icon: Icons.apartment_outlined,
              title: 'Company not found',
              subtitle: 'We could not find the organisation linked to your account.',
            ),
          );
        }

        _syncCompanyFields(company);

        final members = provider.members;
        final adminCount = members.where((member) => member.role.toUpperCase() == 'COMPANY_ADMIN').length;
        final recruiterCount = members.where((member) => member.role.toUpperCase() == 'RECRUITER').length;

        return RefreshIndicator(
          onRefresh: provider.refresh,
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
                        _CompanyOverviewHeader(company: company, memberCount: members.length),
                        const SizedBox(height: 20),
                        _CompanyStatsBar(
                          totalMembers: members.length,
                          adminCount: adminCount,
                          recruiterCount: recruiterCount,
                        ),
                        const SizedBox(height: 24),
                        SectionHeader(
                          title: 'Organisation profile',
                          subtitle: 'Keep your brand information up to date for candidates and teammates.',
                        ),
                        const SizedBox(height: 12),
                        _buildCompanyForm(provider),
                        const SizedBox(height: 28),
                        SectionHeader(
                          title: 'Team members',
                          subtitle: 'Manage who can access your hiring workspace and invite collaborators.',
                        ),
                        const SizedBox(height: 12),
                        _buildMembersCard(provider, members, adminCount, recruiterCount),
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

  Widget _buildCompanyForm(CompanyAdminProvider provider) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      margin: EdgeInsets.zero,
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
        child: Form(
          key: _companyFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _nameController,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Company name',
                  hintText: 'Displayed to candidates and teammates',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                minLines: 3,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Tell candidates about your mission, values, or culture.',
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _websiteController,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Website',
                  hintText: 'https://example.com',
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _logoController,
                decoration: const InputDecoration(
                  labelText: 'Logo URL',
                  hintText: 'Optional — used for dashboards and job postings',
                ),
              ),
              const SizedBox(height: 20),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton.icon(
                  onPressed: provider.isUpdating ? null : () => _submitCompanyUpdate(provider),
                  icon: provider.isUpdating
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.save_outlined),
                  label: Text(provider.isUpdating ? 'Saving...' : 'Save changes'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMembersCard(
    CompanyAdminProvider provider,
    List<CompanyUser> members,
    int adminCount,
    int recruiterCount,
  ) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                Chip(
                  avatar: const Icon(Icons.people_outline, size: 16),
                  label: Text(' total'),
                ),
                Chip(
                  avatar: const Icon(Icons.admin_panel_settings_outlined, size: 16),
                  label: Text(' admin'),
                ),
                Chip(
                  avatar: const Icon(Icons.badge_outlined, size: 16),
                  label: Text(' recruiter'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (members.isEmpty)
              _MembersPlaceholder(onInvite: () => _showInviteDialog(provider))
            else
              Column(
                children: [
                  ...members.map(
                    (member) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: CircleAvatar(
                        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.12),
                        child: Text(
                          (member.email ?? '#')
                              .trim()
                              .substring(0, 1)
                              .toUpperCase(),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ),
                      title: Text(member.email ?? 'User #'),
                      subtitle: Text(member.role),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerRight,
                    child: OutlinedButton.icon(
                      onPressed: provider.isInviting ? null : () => _showInviteDialog(provider),
                      icon: provider.isInviting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.person_add_alt_1_rounded),
                      label: Text(provider.isInviting ? 'Sending...' : 'Invite teammate'),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _CompanyOverviewHeader extends StatelessWidget {
  const _CompanyOverviewHeader({required this.company, required this.memberCount});

  final Company company;
  final int memberCount;

  @override
  Widget build(BuildContext context) {
    final initials = company.name
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
                      company.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      ' active member',
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
          if ((company.description ?? '').isNotEmpty) ...[
            const SizedBox(height: 20),
            Text(
              company.description!,
              style: TextStyle(
                color: Colors.white.withOpacity(0.92),
                fontSize: 15,
              ),
            ),
          ],
          if ((company.website ?? '').isNotEmpty) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(Icons.public, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    company.website!,
                    style: const TextStyle(
                      color: Colors.white,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _CompanyStatsBar extends StatelessWidget {
  const _CompanyStatsBar({
    required this.totalMembers,
    required this.adminCount,
    required this.recruiterCount,
  });

  final int totalMembers;
  final int adminCount;
  final int recruiterCount;

  @override
  Widget build(BuildContext context) {
    final stats = [
      _CompanyStat(
        icon: Icons.people_outline,
        label: 'Active members',
        value: totalMembers,
        color: Theme.of(context).colorScheme.primary,
      ),
      _CompanyStat(
        icon: Icons.admin_panel_settings_outlined,
        label: 'Admins',
        value: adminCount,
        color: const Color(0xFF6366F1),
      ),
      _CompanyStat(
        icon: Icons.badge_outlined,
        label: 'Recruiters',
        value: recruiterCount,
        color: const Color(0xFFF97316),
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 900;
        final cardWidth = isWide ? (constraints.maxWidth - 32) / 3 : constraints.maxWidth;
        return Wrap(
          spacing: 16,
          runSpacing: 12,
          children: stats
              .map(
                (stat) => SizedBox(
                  width: cardWidth,
                  child: _CompanyStatTile(stat: stat),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class _CompanyStat {
  const _CompanyStat({
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

class _CompanyStatTile extends StatelessWidget {
  const _CompanyStatTile({required this.stat});

  final _CompanyStat stat;

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

class _MembersPlaceholder extends StatelessWidget {
  const _MembersPlaceholder({required this.onInvite});

  final VoidCallback onInvite;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'No teammates yet. Invite colleagues to collaborate on hiring.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerRight,
            child: OutlinedButton.icon(
              onPressed: onInvite,
              icon: const Icon(Icons.person_add_alt_1_rounded),
              label: const Text('Invite teammate'),
            ),
          ),
        ],
      ),
    );
  }
}

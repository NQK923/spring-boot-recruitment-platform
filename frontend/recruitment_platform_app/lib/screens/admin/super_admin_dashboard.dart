import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/company.dart';
import '../../models/company_user.dart';
import '../../providers/auth_provider.dart';
import '../../providers/super_admin_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/layout/dashboard_shell.dart';
import '../../widgets/section_header.dart';

class SuperAdminDashboard extends StatefulWidget {
  const SuperAdminDashboard({super.key});

  @override
  State<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends State<SuperAdminDashboard> {
  Future<void> _showCreateCompanyDialog(BuildContext context) async {
    final provider = context.read<SuperAdminProvider>();
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    final websiteController = TextEditingController();
    final logoController = TextEditingController();
    bool submitting = false;
    String? localError;

    try {
      final result = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return StatefulBuilder(
            builder: (dialogContext, setDialogState) {
              return AlertDialog(
                title: const Text('Create company'),
                content: Form(
                  key: formKey,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextFormField(
                          controller: nameController,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Company name',
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Name is required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: descriptionController,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'Description (optional)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: websiteController,
                          decoration: const InputDecoration(
                            labelText: 'Website (optional)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: logoController,
                          decoration: const InputDecoration(
                            labelText: 'Logo URL (optional)',
                            border: OutlineInputBorder(),
                          ),
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
                            final success = await provider.createCompany(
                              name: nameController.text.trim(),
                              description: descriptionController.text.trim().isEmpty
                                  ? null
                                  : descriptionController.text.trim(),
                              website: websiteController.text.trim().isEmpty
                                  ? null
                                  : websiteController.text.trim(),
                              logoUrl: logoController.text.trim().isEmpty
                                  ? null
                                  : logoController.text.trim(),
                            );
                            if (!mounted || !dialogContext.mounted) {
                              return;
                            }
                            if (success) {
                              Navigator.of(dialogContext).pop(true);
                            } else {
                              setDialogState(() {
                                submitting = false;
                                localError = provider.error ?? 'Failed to create company.';
                              });
                            }
                          },
                    child: submitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Create'),
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
          const SnackBar(content: Text('Company created successfully')),
        );
      }
    } finally {
      nameController.dispose();
      descriptionController.dispose();
      websiteController.dispose();
      logoController.dispose();
    }
  }

  Future<void> _showInviteDialog(BuildContext context, Company company) async {
    final provider = context.read<SuperAdminProvider>();
    final formKey = GlobalKey<FormState>();
    final emailController = TextEditingController();
    String selectedRole = 'COMPANY_ADMIN';
    bool submitting = false;
    String? localError;

    try {
      final result = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return StatefulBuilder(
            builder: (dialogContext, setDialogState) {
              return AlertDialog(
                title: Text('Invite user to ${company.name}'),
                content: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Email is required';
                          }
                          if (!value.contains('@')) {
                            return 'Enter a valid email address';
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
                          DropdownMenuItem(
                            value: 'COMPANY_ADMIN',
                            child: Text('Company Admin'),
                          ),
                          DropdownMenuItem(
                            value: 'RECRUITER',
                            child: Text('Recruiter'),
                          ),
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
                            final success = await provider.inviteCompanyUser(
                              companyId: company.id,
                              email: emailController.text.trim(),
                              role: selectedRole,
                            );
                            if (!mounted || !dialogContext.mounted) {
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
          SnackBar(content: Text('Invitation email sent to ${emailController.text.trim()}')),
        );
      }
    } finally {
      emailController.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    return Consumer<SuperAdminProvider>(
      builder: (context, provider, _) {
        final totalCompanies = provider.companies.length;
        final knownMembers = provider.companies.fold<int>(
          0,
          (sum, company) => sum + provider.membersForCompany(company.id).length,
        );
        final companiesWithoutMembers = provider.companies
            .where((company) => provider.membersForCompany(company.id).isEmpty)
            .length;

        final tabs = [
          DashboardTab(
            id: 'companies',
            icon: Icons.apartment_outlined,
            label: 'Companies',
            title: 'Multi-tenant control center',
            subtitle: 'Create tenants, manage memberships, and keep invitations on track.',
            badge: Chip(
              avatar: const Icon(Icons.domain, size: 16),
              label: Text('$totalCompanies tenants'),
            ),
            actions: [
              OutlinedButton.icon(
                onPressed: provider.isLoading ? null : provider.fetchCompanies,
                icon: provider.isLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
              FilledButton.icon(
                onPressed: () => _showCreateCompanyDialog(context),
                icon: const Icon(Icons.add_business_outlined),
                label: const Text('New company'),
              ),
            ],
            child: _SuperAdminCompaniesView(
              provider: provider,
              totalCompanies: totalCompanies,
              knownMembers: knownMembers,
              companiesWithoutMembers: companiesWithoutMembers,
              onInvite: (company) => _showInviteDialog(context, company),
            ),
          ),
        ];

        return DashboardShell(
          tabs: tabs,
          onLogout: authProvider.logout,
        );
      },
    );
  }
}

class _SuperAdminCompaniesView extends StatelessWidget {
  const _SuperAdminCompaniesView({
    required this.provider,
    required this.totalCompanies,
    required this.knownMembers,
    required this.companiesWithoutMembers,
    required this.onInvite,
  });

  final SuperAdminProvider provider;
  final int totalCompanies;
  final int knownMembers;
  final int companiesWithoutMembers;
  final void Function(Company) onInvite;

  @override
  Widget build(BuildContext context) {
    if (provider.isLoading && provider.companies.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.error != null && provider.companies.isEmpty) {
      return Center(
        child: EmptyState(
          icon: Icons.warning_amber_outlined,
          title: 'Unable to load companies',
          subtitle: provider.error!,
          action: OutlinedButton.icon(
            onPressed: provider.fetchCompanies,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Retry'),
          ),
        ),
      );
    }

    if (provider.companies.isEmpty) {
      return const Center(
        child: EmptyState(
          icon: Icons.apartment_outlined,
          title: 'No companies yet',
          subtitle: 'Create your first tenant to start organising teams and permissions.',
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: provider.fetchCompanies,
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
                      title: 'Tenant overview',
                      subtitle: 'Monitor adoption and keep every organisation in sync.',
                    ),
                    const SizedBox(height: 16),
                    _DashboardStats(
                      totalCompanies: totalCompanies,
                      knownMembers: knownMembers,
                      teamsWithoutMembers: companiesWithoutMembers,
                    ),
                    const SizedBox(height: 24),
                    SectionHeader(
                      title: 'Company directory',
                      subtitle: 'Expand a company to review teams, invite collaborators, or refresh members.',
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final company = provider.companies[index];
                    final members = provider.membersForCompany(company.id);
                    final isLoadingMembers = provider.isLoadingMembers(company.id);
                    final membersError = provider.membersError(company.id);

                    return _CompanyCard(
                      company: company,
                      members: members,
                      isLoadingMembers: isLoadingMembers,
                      membersError: membersError,
                      onLoadMembers: () => provider.loadCompanyMembers(company.id),
                      onInvite: () => onInvite(company),
                    );
                  },
                  childCount: provider.companies.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 48)),
          ],
        ),
      ),
    );
  }
}

class _DashboardStats extends StatelessWidget {
  const _DashboardStats({
    required this.totalCompanies,
    required this.knownMembers,
    required this.teamsWithoutMembers,
  });

  final int totalCompanies;
  final int knownMembers;
  final int teamsWithoutMembers;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tiles = [
      _StatCardData(
        icon: Icons.apartment_outlined,
        label: 'Total tenants',
        value: '$totalCompanies',
        color: theme.colorScheme.primary,
      ),
      _StatCardData(
        icon: Icons.people_outline,
        label: 'Recorded members',
        value: '$knownMembers',
        color: const Color(0xFF0EA5E9),
      ),
      _StatCardData(
        icon: Icons.upcoming_outlined,
        label: 'Teams needing setup',
        value: '$teamsWithoutMembers',
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
          children: tiles
              .map(
                (tile) => SizedBox(
                  width: cardWidth,
                  child: _DashboardStatTile(data: tile),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class _StatCardData {
  const _StatCardData({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;
}

class _DashboardStatTile extends StatelessWidget {
  const _DashboardStatTile({required this.data});

  final _StatCardData data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      decoration: BoxDecoration(
        color: data.color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(data.icon, color: data.color),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                data.value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: data.color,
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                data.label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CompanyCard extends StatefulWidget {
  const _CompanyCard({
    required this.company,
    required this.members,
    required this.isLoadingMembers,
    required this.membersError,
    required this.onLoadMembers,
    required this.onInvite,
  });

  final Company company;
  final List<CompanyUser> members;
  final bool isLoadingMembers;
  final String? membersError;
  final Future<void> Function() onLoadMembers;
  final VoidCallback onInvite;

  @override
  State<_CompanyCard> createState() => _CompanyCardState();
}

class _CompanyCardState extends State<_CompanyCard> {
  bool _expanded = false;

  void _toggleExpanded() {
    setState(() => _expanded = !_expanded);
    if (_expanded && widget.members.isEmpty && !widget.isLoadingMembers && widget.membersError == null) {
      widget.onLoadMembers();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final membersCount = widget.members.length;
    final initials = widget.company.name.trim().isEmpty
        ? '??'
        : widget.company.name
            .trim()
            .split(' ')
            .take(2)
            .map((part) => part.isNotEmpty ? part[0] : '')
            .join()
            .toUpperCase();

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
        child: Column(
          children: [
            InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: _toggleExpanded,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: theme.colorScheme.primary.withOpacity(0.14),
                      child: Text(
                        initials,
                        style: theme.textTheme.titleLarge?.copyWith(
                          color: theme.colorScheme.primary,
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
                            widget.company.name,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          if (widget.company.website != null && widget.company.website!.isNotEmpty)
                            Text(
                              widget.company.website!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          if (widget.company.description != null && widget.company.description!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              widget.company.description!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Chip(
                          avatar: const Icon(Icons.people_outline, size: 16),
                          label: Text('$membersCount members'),
                        ),
                        const SizedBox(height: 12),
                        AnimatedRotation(
                          turns: _expanded ? 0.5 : 0,
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            Icons.expand_more_rounded,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            AnimatedCrossFade(
              crossFadeState: _expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
              firstChild: const SizedBox.shrink(),
              secondChild: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Divider(),
                    const SizedBox(height: 16),
                    Text(
                      'Team members',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 12),
                    if (widget.isLoadingMembers)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (widget.membersError != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.membersError!.replaceFirst('Exception: ', ''),
                              style: const TextStyle(color: Colors.redAccent),
                            ),
                            const SizedBox(height: 8),
                            OutlinedButton.icon(
                              onPressed: widget.onLoadMembers,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    else if (widget.members.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.info_outline, color: theme.colorScheme.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'No members have joined yet. Send an invitation to get this team started.',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      Column(
                        children: widget.members
                            .map(
                              (member) => ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 4),
                                leading: CircleAvatar(
                                  backgroundColor: theme.colorScheme.primary.withOpacity(0.12),
                                  child: Text(
                                    (member.email ?? '#${member.userId}')
                                        .trim()
                                        .substring(0, 1)
                                        .toUpperCase(),
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      color: theme.colorScheme.primary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                title: Text(member.email ?? 'User #${member.userId}'),
                                subtitle: Text(member.role),
                              ),
                            )
                            .toList(),
                      ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        OutlinedButton.icon(
                          onPressed: widget.isLoadingMembers ? null : widget.onLoadMembers,
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('Refresh'),
                        ),
                        const SizedBox(width: 12),
                        FilledButton.icon(
                          onPressed: widget.onInvite,
                          icon: const Icon(Icons.person_add_alt_1_rounded),
                          label: const Text('Invite teammate'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

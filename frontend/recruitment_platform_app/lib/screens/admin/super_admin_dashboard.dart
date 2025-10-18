import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/super_admin_provider.dart';

class SuperAdminDashboard extends StatefulWidget {
  const SuperAdminDashboard({super.key});

  @override
  State<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends State<SuperAdminDashboard> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _websiteController = TextEditingController();
  final _logoController = TextEditingController();
  final Set<int> _expandedCompanyIds = {};

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _websiteController.dispose();
    _logoController.dispose();
    super.dispose();
  }

  Future<void> _createCompany(BuildContext context) async {
    final provider = Provider.of<SuperAdminProvider>(context, listen: false);
    _nameController.clear();
    _descriptionController.clear();
    _websiteController.clear();
    _logoController.clear();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Create Company', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder()),
                  validator: (value) => value == null || value.trim().isEmpty ? 'Name is required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _websiteController,
                  decoration: const InputDecoration(labelText: 'Website', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _logoController,
                  decoration: const InputDecoration(labelText: 'Logo URL', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: provider.isSubmitting
                        ? null
                        : () async {
                            if (!_formKey.currentState!.validate()) return;
                            final success = await provider.createCompany(
                              name: _nameController.text.trim(),
                              description: _descriptionController.text.trim().isEmpty
                                  ? null
                                  : _descriptionController.text.trim(),
                              website: _websiteController.text.trim().isEmpty
                                  ? null
                                  : _websiteController.text.trim(),
                              logoUrl: _logoController.text.trim().isEmpty
                                  ? null
                                  : _logoController.text.trim(),
                            );
                            if (!mounted) return;
                            if (success) {
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Company created successfully')),
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(provider.error ?? 'Failed to create company')),
                              );
                            }
                          },
                    icon: provider.isSubmitting
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.add_business_outlined),
                    label: Text(provider.isSubmitting ? 'Creating...' : 'Create Company'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _inviteForCompany(BuildContext context, int companyId) async {
    final provider = Provider.of<SuperAdminProvider>(context, listen: false);
    final emailController = TextEditingController();
    String role = 'COMPANY_ADMIN';

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Invite to company #$companyId', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              TextField(
                controller: emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Role',
                  border: OutlineInputBorder(),
                ),
                child: StatefulBuilder(
                  builder: (context, setDialogState) {
                    return DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: role,
                        items: const [
                          DropdownMenuItem(value: 'COMPANY_ADMIN', child: Text('Company Admin')),
                          DropdownMenuItem(value: 'RECRUITER', child: Text('Recruiter')),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setDialogState(() {
                              role = value;
                            });
                          }
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: provider.isSubmitting
                      ? null
                      : () async {
                          final email = emailController.text.trim();
                          if (email.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter an email.')),
                            );
                            return;
                          }
                          final success = await provider.inviteCompanyUser(
                            companyId: companyId,
                            email: email,
                            role: role,
                          );
                          if (!mounted) return;
                          if (success) {
                            Navigator.of(ctx).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Invitation sent.')),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(provider.error ?? 'Failed to send invitation')),
                            );
                          }
                        },
                  icon: provider.isSubmitting
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.send),
                  label: Text(provider.isSubmitting ? 'Sending...' : 'Send Invite'),
                ),
              ),
            ],
          ),
        );
      },
    );

    emailController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SuperAdminProvider>(
      builder: (context, provider, _) {
        final isSuperAdmin = provider.authProvider.user?.hasRole('SUPER_ADMIN') ?? false;
        if (!isSuperAdmin) {
          return const Scaffold(
            body: Center(child: Text('This area is restricted to Super Admins.')),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('Super Admin Dashboard'),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: provider.isLoading ? null : provider.fetchCompanies,
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: provider.isSubmitting ? null : () => _createCompany(context),
            icon: const Icon(Icons.add),
            label: const Text('New Company'),
          ),
          body: provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : provider.error != null && provider.companies.isEmpty
                  ? Center(child: Text(provider.error!))
                  : RefreshIndicator(
                      onRefresh: provider.fetchCompanies,
                      child: provider.companies.isEmpty
                          ? ListView(
                              children: const [
                                SizedBox(height: 200),
                                Center(child: Text('No companies found. Create one to get started.')),
                              ],
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: provider.companies.length + 1,
                              itemBuilder: (context, index) {
                                if (index == 0) {
                                  final totalCompanies = provider.companies.length;
                                  final totalMembers = provider.companies
                                      .map((company) => provider.membersForCompany(company.id).length)
                                      .fold<int>(0, (prev, element) => prev + element);
                                  return Card(
                                    color: Theme.of(context).colorScheme.surfaceVariant,
                                    child: Padding(
                                      padding: const EdgeInsets.all(16.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.stretch,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                            children: [
                                              _StatTile(label: 'Companies', value: '$totalCompanies'),
                                              _StatTile(label: 'Known Members', value: '$totalMembers'),
                                            ],
                                          ),
                                          const SizedBox(height: 12),
                                          Align(
                                            alignment: Alignment.centerRight,
                                            child: TextButton.icon(
                                              onPressed: provider.isLoading
                                                  ? null
                                                  : () => provider.loadMembersForAllCompanies(),
                                              icon: const Icon(Icons.group_outlined),
                                              label: const Text('Load members'),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }

                                final company = provider.companies[index - 1];
                                final isExpanded = _expandedCompanyIds.contains(company.id);
                                final members = provider.membersForCompany(company.id);
                                final membersError = provider.membersError(company.id);
                                final isLoadingMembers = provider.isLoadingMembers(company.id);

                                return Card(
                                  elevation: 2,
                                  child: ExpansionTile(
                                    key: PageStorageKey('company_${company.id}'),
                                    title: Text(company.name),
                                    subtitle: company.website != null && company.website!.isNotEmpty
                                        ? Text(company.website!, maxLines: 1, overflow: TextOverflow.ellipsis)
                                        : null,
                                    initiallyExpanded: isExpanded,
                                    onExpansionChanged: (expanded) {
                                      setState(() {
                                        if (expanded) {
                                          _expandedCompanyIds.add(company.id);
                                          provider.loadCompanyMembers(company.id);
                                        } else {
                                          _expandedCompanyIds.remove(company.id);
                                        }
                                      });
                                    },
                                    children: [
                                      if (company.description != null && company.description!.isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4),
                                          child: Text(company.description!),
                                        ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text('Members: ${members.length}',
                                                style: Theme.of(context).textTheme.bodyMedium),
                                            TextButton.icon(
                                              onPressed: () => _inviteForCompany(context, company.id),
                                              icon: const Icon(Icons.person_add_alt_1_outlined),
                                              label: const Text('Invite'),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (isLoadingMembers)
                                        const Padding(
                                          padding: EdgeInsets.symmetric(vertical: 16),
                                          child: Center(child: CircularProgressIndicator()),
                                        )
                                      else if (membersError != null)
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                                          child: Text(membersError, style: const TextStyle(color: Colors.redAccent)),
                                        )
                                      else if (members.isEmpty)
                                        const Padding(
                                          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                                          child: Text('No members yet.'),
                                        )
                                      else
                                        Padding(
                                          padding: const EdgeInsets.only(bottom: 12.0),
                                          child: Column(
                                            children: members.map((member) {
                                              return ListTile(
                                                leading: const Icon(Icons.person_outline),
                                                title: Text(member.email ?? 'User #${member.userId}'),
                                                subtitle: Text('Role: ${member.role}'),
                                                dense: true,
                                              );
                                            }).toList(),
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),
        );
      },
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;

  const _StatTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(value, style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: theme.textTheme.bodyMedium),
      ],
    );
  }
}

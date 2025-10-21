import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/company.dart';
import '../../models/company_user.dart';
import '../../providers/company_admin_provider.dart';

class CompanyAdminScreen extends StatefulWidget {
  const CompanyAdminScreen({super.key});

  @override
  State<CompanyAdminScreen> createState() => _CompanyAdminScreenState();
}

class _CompanyAdminScreenState extends State<CompanyAdminScreen> {
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _websiteController = TextEditingController();
  final _logoUrlController = TextEditingController();
  final _companyFormKey = GlobalKey<FormState>();
  Company? _lastSyncedCompany;
  String _selectedRole = 'RECRUITER';
  String? _updateError;

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    _descriptionController.dispose();
    _websiteController.dispose();
    _logoUrlController.dispose();
    super.dispose();
  }

  void _syncCompanyForm(Company company) {
    if (_lastSyncedCompany == null ||
        _lastSyncedCompany!.name != company.name ||
        _lastSyncedCompany!.description != company.description ||
        _lastSyncedCompany!.website != company.website ||
        _lastSyncedCompany!.logoUrl != company.logoUrl) {
      _nameController.text = company.name;
      _descriptionController.text = company.description ?? '';
      _websiteController.text = company.website ?? '';
      _logoUrlController.text = company.logoUrl ?? '';
      _lastSyncedCompany = company;
    }
  }

  Future<void> _submitInvite(BuildContext context) async {
    final provider = Provider.of<CompanyAdminProvider>(context, listen: false);
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an email address.')),
      );
      return;
    }

    final success = await provider.inviteUser(email: email, role: _selectedRole);
    if (!mounted) return;

    if (success) {
      _emailController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invitation sent!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'Failed to send invite')),
      );
    }
  }

  Future<void> _submitCompanyUpdate(BuildContext context) async {
    final provider = context.read<CompanyAdminProvider>();
    final form = _companyFormKey.currentState;
    if (form == null) return;

    if (!form.validate()) {
      return;
    }

    setState(() {
      _updateError = null;
    });

    final name = _nameController.text.trim();
    final description = _descriptionController.text.trim();
    final website = _websiteController.text.trim();
    final logoUrl = _logoUrlController.text.trim();

    final success = await provider.updateCompany(
      name: name,
      description: description.isEmpty ? null : description,
      website: website.isEmpty ? null : website,
      logoUrl: logoUrl.isEmpty ? null : logoUrl,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Company information updated')),
      );
      _lastSyncedCompany = provider.company;
    } else {
      setState(() {
        _updateError = provider.error ?? 'Failed to update company';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_updateError!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CompanyAdminProvider>(
      builder: (context, provider, _) {
        final isCompanyAdmin = provider.authProvider.user?.hasRole('COMPANY_ADMIN') ?? false;

        if (!isCompanyAdmin) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('Company administration is only available to Company Admins.'),
            ),
          );
        }

        if (provider.isLoading && provider.company == null) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && provider.company == null) {
          return Center(child: Text(provider.error!));
        }

        final company = provider.company;
        final members = provider.members;

        if (company != null) {
          _syncCompanyForm(company);
        }

        return RefreshIndicator(
          onRefresh: provider.refresh,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (company != null) ...[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Company details',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 12),
                        Form(
                          key: _companyFormKey,
                          child: Column(
                            children: [
                              TextFormField(
                                controller: _nameController,
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
                                controller: _descriptionController,
                                decoration: const InputDecoration(
                                  labelText: 'Description',
                                  border: OutlineInputBorder(),
                                ),
                                maxLines: 3,
                              ),
                              const SizedBox(height: 12),
                              TextFormField(
                                controller: _websiteController,
                                decoration: const InputDecoration(
                                  labelText: 'Website',
                                  border: OutlineInputBorder(),
                                  hintText: 'https://example.com',
                                ),
                                keyboardType: TextInputType.url,
                              ),
                              const SizedBox(height: 12),
                              TextFormField(
                                controller: _logoUrlController,
                                decoration: const InputDecoration(
                                  labelText: 'Logo URL',
                                  border: OutlineInputBorder(),
                                ),
                                keyboardType: TextInputType.url,
                              ),
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: provider.isUpdating
                                      ? null
                                      : () => _submitCompanyUpdate(context),
                                  icon: provider.isUpdating
                                      ? const SizedBox(
                                          width: 16,
                                          height: 16,
                                          child: CircularProgressIndicator(strokeWidth: 2),
                                        )
                                      : const Icon(Icons.save_outlined),
                                  label:
                                      Text(provider.isUpdating ? 'Saving...' : 'Save changes'),
                                ),
                              ),
                              if (_updateError != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    _updateError!,
                                    style: const TextStyle(color: Colors.redAccent),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
              Text('Team Members', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              if (members.isEmpty)
                const Card(
                  child: ListTile(
                    leading: Icon(Icons.people_outline),
                    title: Text('No team members yet. Invite someone below.'),
                  ),
                )
              else
                ...members.map((member) => _CompanyMemberTile(member: member)),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Invite a teammate', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _emailController,
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
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedRole,
                            items: const [
                              DropdownMenuItem(value: 'RECRUITER', child: Text('Recruiter')),
                              DropdownMenuItem(value: 'COMPANY_ADMIN', child: Text('Company Admin')),
                            ],
                            onChanged: (value) {
                              if (value != null) {
                                setState(() {
                                  _selectedRole = value;
                                });
                              }
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: provider.isInviting ? null : () => _submitInvite(context),
                          icon: provider.isInviting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.send),
                          label: Text(provider.isInviting ? 'Sending...' : 'Send Invite'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _CompanyMemberTile extends StatelessWidget {
  final CompanyUser member;

  const _CompanyMemberTile({required this.member});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.person_outline)),
        title: Text(member.email ?? 'User #${member.userId}'),
        subtitle: Text('Role: ${member.role}'),
        trailing: member.role.toUpperCase() == 'COMPANY_ADMIN'
            ? const Chip(label: Text('Admin'))
            : null,
      ),
    );
  }
}


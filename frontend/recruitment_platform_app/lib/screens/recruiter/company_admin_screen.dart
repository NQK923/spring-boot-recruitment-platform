import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/company_user.dart';
import '../../providers/company_admin_provider.dart';

class CompanyAdminScreen extends StatefulWidget {
  const CompanyAdminScreen({super.key});

  @override
  State<CompanyAdminScreen> createState() => _CompanyAdminScreenState();
}

class _CompanyAdminScreenState extends State<CompanyAdminScreen> {
  final _emailController = TextEditingController();
  String _selectedRole = 'RECRUITER';

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
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

        return RefreshIndicator(
          onRefresh: () => provider.refresh(),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (company != null) ...[
                Text(
                  company.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                if (company.description != null && company.description!.isNotEmpty)
                  Text(company.description!),
                if (company.website != null && company.website!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Text(
                      company.website!,
                      style: const TextStyle(color: Colors.blueAccent),
                    ),
                  ),
                const SizedBox(height: 20),
              ],
              Text('Team Members', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              if (provider.error != null && provider.members.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Text(
                    'Warning: ${provider.error}',
                    style: const TextStyle(color: Colors.orange),
                  ),
                ),
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
              Text('Invite a teammate', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
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

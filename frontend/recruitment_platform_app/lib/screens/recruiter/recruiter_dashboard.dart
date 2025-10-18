import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import './job_postings_screen.dart';
import './recruiter_interviews_screen.dart';
import './company_admin_screen.dart';

class RecruiterDashboard extends StatefulWidget {
  const RecruiterDashboard({super.key});

  @override
  _RecruiterDashboardState createState() => _RecruiterDashboardState();
}

class _RecruiterDashboardState extends State<RecruiterDashboard> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final isCompanyAdmin = authProvider.user?.hasRole('COMPANY_ADMIN') ?? false;

        final tabs = <Widget>[
          const JobPostingsScreen(),
          const RecruiterInterviewsScreen(),
          isCompanyAdmin
              ? const CompanyAdminScreen()
              : const Scaffold(body: Center(child: Text('Settings coming soon'))),
        ];

        final navItems = <BottomNavigationBarItem>[
          const BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            label: 'My Jobs',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            label: 'Interviews',
          ),
          BottomNavigationBarItem(
            icon: Icon(isCompanyAdmin ? Icons.apartment_outlined : Icons.settings_outlined),
            label: isCompanyAdmin ? 'Company' : 'Settings',
          ),
        ];

        if (_selectedIndex >= tabs.length) {
          _selectedIndex = tabs.length - 1;
        }

        return Scaffold(
          body: IndexedStack(
            index: _selectedIndex,
            children: tabs,
          ),
          bottomNavigationBar: BottomNavigationBar(
            items: navItems,
            currentIndex: _selectedIndex,
            onTap: _onItemTapped,
            type: BottomNavigationBarType.fixed,
          ),
        );
      },
    );
  }
}

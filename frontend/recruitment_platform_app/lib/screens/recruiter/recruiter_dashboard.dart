import 'package:flutter/material.dart';
import './job_postings_screen.dart';

class RecruiterDashboard extends StatefulWidget {
  const RecruiterDashboard({super.key});

  @override
  _RecruiterDashboardState createState() => _RecruiterDashboardState();
}

class _RecruiterDashboardState extends State<RecruiterDashboard> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    JobPostingsScreen(),
    // Placeholder for other recruiter screens like 'Candidates' or 'Settings'
    Scaffold(body: Center(child: Text('All Candidates'))),
    Scaffold(body: Center(child: Text('Settings'))),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _widgetOptions,
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            label: 'My Jobs',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            label: 'Candidates',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            label: 'Settings',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        // Make sure to set type and colors for more than 3 items
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import './job_list_screen.dart';
import './my_applications_screen.dart';
import './profile_screen.dart';

class CandidateDashboard extends StatefulWidget {
  const CandidateDashboard({Key? key}) : super(key: key);

  @override
  _CandidateDashboardState createState() => _CandidateDashboardState();
}

class _CandidateDashboardState extends State<CandidateDashboard> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    JobListScreen(),
    MyApplicationsScreen(),
    ProfileScreen(),
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
            icon: Icon(Icons.work),
            label: 'Jobs',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.article),
            label: 'Applications',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import './providers/application_provider.dart';
import './providers/auth_provider.dart';
import './providers/company_admin_provider.dart';
import './providers/job_provider.dart';
import './providers/profile_provider.dart';
import './providers/recruiter_provider.dart';
import './providers/interview_provider.dart';
import './providers/super_admin_provider.dart';
import './screens/auth_wrapper.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => JobProvider()),
        ChangeNotifierProxyProvider<AuthProvider, ApplicationProvider>(
          create: (ctx) => ApplicationProvider(Provider.of<AuthProvider>(ctx, listen: false)),
          update: (ctx, auth, previous) {
            final provider = previous ?? ApplicationProvider(auth);
            provider.updateAuth(auth);
            return provider;
          },
        ),
        ChangeNotifierProxyProvider<AuthProvider, ProfileProvider>(
          create: (ctx) => ProfileProvider(Provider.of<AuthProvider>(ctx, listen: false)),
          update: (ctx, auth, previous) {
            final provider = previous ?? ProfileProvider(auth);
            provider.updateAuth(auth);
            return provider;
          },
        ),
        ChangeNotifierProxyProvider<AuthProvider, RecruiterProvider>(
          create: (ctx) => RecruiterProvider(Provider.of<AuthProvider>(ctx, listen: false)),
          update: (ctx, auth, previous) {
            final provider = previous ?? RecruiterProvider(auth);
            provider.updateAuth(auth);
            return provider;
          },
        ),
        ChangeNotifierProxyProvider<AuthProvider, InterviewProvider>(
          create: (ctx) => InterviewProvider(Provider.of<AuthProvider>(ctx, listen: false)),
          update: (ctx, auth, previous) {
            final provider = previous ?? InterviewProvider(auth);
            provider.updateAuth(auth);
            return provider;
          },
        ),
        ChangeNotifierProxyProvider<AuthProvider, CompanyAdminProvider>(
          create: (ctx) => CompanyAdminProvider(Provider.of<AuthProvider>(ctx, listen: false)),
          update: (ctx, auth, previous) {
            final provider = previous ?? CompanyAdminProvider(auth);
            provider.updateAuth(auth);
            return provider;
          },
        ),
        ChangeNotifierProxyProvider<AuthProvider, SuperAdminProvider>(
          create: (ctx) => SuperAdminProvider(Provider.of<AuthProvider>(ctx, listen: false)),
          update: (ctx, auth, previous) {
            final provider = previous ?? SuperAdminProvider(auth);
            provider.updateAuth(auth);
            return provider;
          },
        ),
      ],
      child: MaterialApp(
        title: 'Recruitment Platform',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: const AuthWrapper(),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:recruitment_platform_app/screens/recruiter/job_postings_screen.dart';

void main() {
  testWidgets('JobStatusBadge renders formatted status and theme', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: JobStatusBadge(status: 'open'),
        ),
      ),
    );

    expect(find.text('Open'), findsOneWidget);

    final chip = tester.widget<Chip>(find.byType(Chip));
    expect(chip.backgroundColor, equals(const Color(0xFF16A34A).withOpacity(0.12)));
    expect(chip.label, isA<Text>().having((label) => label.style?.fontWeight, 'weight', FontWeight.w600));
  });
}

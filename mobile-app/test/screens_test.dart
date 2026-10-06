import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:smart_symptom_ai/core/providers.dart';
import 'package:smart_symptom_ai/features/first_aid/first_aid_screen.dart';
import 'package:smart_symptom_ai/features/history/history_screen.dart';
import 'package:smart_symptom_ai/features/onboarding/onboarding_screen.dart';
import 'package:smart_symptom_ai/features/results/results_screen.dart';
import 'package:smart_symptom_ai/models/illness.dart';
import 'package:smart_symptom_ai/models/prediction_result.dart';
import 'package:smart_symptom_ai/models/symptom_session.dart';
import 'package:smart_symptom_ai/services/supabase_service.dart';

/// A SupabaseService that returns no rows, so widget tests never touch the
/// network. Only the methods under test are overridden.
class _SupabaseServiceStub extends SupabaseService {
  _SupabaseServiceStub()
    : super(
        SupabaseClient(
          'https://example.supabase.co',
          'anonkey',
          authOptions: const AuthClientOptions(autoRefreshToken: false),
        ),
      );

  @override
  Future<List<Illness>> fetchIllnesses({String? category}) async => [];

  @override
  Future<List<SymptomSession>> fetchSessions(String uid) async => [];

  @override
  Future<void> deleteSession(String sessionId) async {}
}

/// A stub that returns guides filtered by category, recording the last
/// requested category to prove the screen's filter chip triggers a reload.
class _CategoryStub extends _SupabaseServiceStub {
  String? lastCategory;

  @override
  Future<List<Illness>> fetchIllnesses({String? category}) async {
    lastCategory = category;
    return switch (category) {
      'respiratory' => [
        const Illness(
          id: '1',
          name: 'Influenza (Flu)',
          category: 'respiratory',
          description: 'Viral infection of the respiratory tract.',
          firstAidSteps: ['Rest and hydrate.'],
        ),
      ],
      _ => const [
        Illness(
          id: '2',
          name: 'Eczema',
          category: 'dermatological',
          description: 'Inflammatory skin condition.',
          firstAidSteps: ['Moisturise regularly.'],
        ),
      ],
    };
  }
}

PredictionResult _sampleResult({bool emergency = false}) => PredictionResult(
  possibleIllnesses: ['Common Cold', 'Influenza (Flu)'],
  severity: emergency ? 'critical' : 'moderate',
  firstAidSteps: const [
    'Rest and stay hydrated.',
    'Gargle with warm saltwater.',
  ],
  specialistType: 'General Physician',
  emergencyRequired: emergency,
  additionalInfo: 'Keep the room ventilated.',
  disclaimer: 'Not a substitute for professional medical advice.',
  source: 'kaggle',
);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Onboarding navigation', () {
    // Fresh router per test so navigation state never leaks between cases.
    GoRouter buildRouter() => GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (_, _) => const OnboardingScreen()),
        GoRoute(
          path: '/symptom-checker',
          builder: (_, _) => const _Probe(label: 'CHECKER'),
        ),
        GoRoute(
          path: '/image-checker',
          builder: (_, _) => const _Probe(label: 'IMAGE'),
        ),
        GoRoute(
          path: '/first-aid',
          builder: (_, _) => const _Probe(label: 'FIRST_AID'),
        ),
        GoRoute(
          path: '/doctor-locator',
          builder: (_, _) => const _Probe(label: 'LOCATOR'),
        ),
        GoRoute(
          path: '/emergency',
          builder: (_, _) => const _Probe(label: 'EMERGENCY'),
        ),
      ],
    );

    testWidgets('Check Symptoms CTA opens the symptom checker', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authStateProvider.overrideWith((ref) => Stream.value(null)),
          ],
          child: MaterialApp.router(routerConfig: buildRouter()),
        ),
      );
      await tester.tap(
        find.widgetWithText(FilledButton, 'Check Symptoms').first,
      );
      await tester.pumpAndSettle();
      expect(find.text('CHECKER'), findsOneWidget);
    });

    testWidgets('Emergency CTA opens the emergency screen', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authStateProvider.overrideWith((ref) => Stream.value(null)),
          ],
          child: MaterialApp.router(routerConfig: buildRouter()),
        ),
      );
      final button = find.text('Emergency — Call 1990');
      await tester.ensureVisible(button);
      await tester.pumpAndSettle();
      await tester.tap(button);
      await tester.pumpAndSettle();
      expect(find.text('EMERGENCY'), findsOneWidget);
    });

    testWidgets('First Aid tile opens first aid guide', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authStateProvider.overrideWith((ref) => Stream.value(null)),
          ],
          child: MaterialApp.router(routerConfig: buildRouter()),
        ),
      );
      final tile = find.text('First Aid');
      await tester.ensureVisible(tile);
      await tester.pumpAndSettle();
      await tester.tap(tile);
      await tester.pumpAndSettle();
      expect(find.text('FIRST_AID'), findsOneWidget);
    });

    testWidgets('Find Doctors tile opens the doctor locator', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authStateProvider.overrideWith((ref) => Stream.value(null)),
          ],
          child: MaterialApp.router(routerConfig: buildRouter()),
        ),
      );
      final tile = find.text('Find Doctors');
      await tester.ensureVisible(tile);
      await tester.pumpAndSettle();
      await tester.tap(tile);
      await tester.pumpAndSettle();
      expect(find.text('LOCATOR'), findsOneWidget);
    });
  });

  group('ResultsScreen rendering', () {
    Widget wrap(PredictionResult r) => ProviderScope(
      child: MaterialApp(home: ResultsScreen(result: r)),
    );

    testWidgets('shows illness chips, first-aid, specialist and disclaimer', (
      tester,
    ) async {
      await tester.pumpWidget(wrap(_sampleResult()));
      await tester.pumpAndSettle();
      expect(find.text('Possible illnesses'), findsOneWidget);
      expect(find.text('Common Cold'), findsOneWidget);
      expect(find.text('First aid steps'), findsOneWidget);
      expect(find.text('General Physician'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Not a substitute for professional medical advice.'),
        200,
      );
      expect(
        find.text('Not a substitute for professional medical advice.'),
        findsOneWidget,
      );
    });

    testWidgets('shows an emergency banner for critical results', (
      tester,
    ) async {
      await tester.pumpWidget(wrap(_sampleResult(emergency: true)));
      await tester.pumpAndSettle();
      expect(find.text('Emergency required'), findsOneWidget);
      expect(find.textContaining('1990'), findsOneWidget);
    });
  });

  group('First aid empty state', () {
    testWidgets('shows "No guides found" when catalogue is empty', (
      tester,
    ) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            supabaseServiceProvider.overrideWithValue(_SupabaseServiceStub()),
          ],
          child: const MaterialApp(home: FirstAidScreen()),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('No guides found'), findsOneWidget);
    });

    testWidgets('tapping a category chip reloads and filters without throwing', (
      tester,
    ) async {
      final stub = _CategoryStub();
      await tester.pumpWidget(
        ProviderScope(
          overrides: [supabaseServiceProvider.overrideWithValue(stub)],
          child: const MaterialApp(home: FirstAidScreen()),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Respiratory'));
      await tester.pumpAndSettle();
      expect(stub.lastCategory, 'respiratory');
      expect(find.text('Influenza (Flu)'), findsOneWidget);
      expect(find.text('Eczema'), findsNothing);
    });
  });

  group('History empty state', () {
    testWidgets('prompts sign-in when not logged in', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            supabaseServiceProvider.overrideWithValue(_SupabaseServiceStub()),
            currentUserProvider.overrideWithValue(null),
          ],
          child: const MaterialApp(home: HistoryScreen()),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Please sign in'), findsOneWidget);
    });
  });
}

/// Simple landing widget used as a navigation target in routing tests.
class _Probe extends StatelessWidget {
  const _Probe({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) =>
      Scaffold(body: Center(child: Text(label)));
}

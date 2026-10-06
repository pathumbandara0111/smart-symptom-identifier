import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/dashboard/dashboard_screen.dart';
import 'features/doctor_locator/doctor_locator_screen.dart';
import 'features/emergency/emergency_screen.dart';
import 'features/first_aid/first_aid_screen.dart';
import 'features/history/history_screen.dart';
import 'features/image_checker/image_checker_screen.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/results/results_screen.dart';
import 'features/splash/splash_screen.dart';
import 'features/symptom_checker/symptom_checker_screen.dart';
import 'models/prediction_result.dart';
import 'widgets/coming_soon.dart';

/// Auth-aware router. Listens to Firebase auth state and redirects:
///   - unauthenticated users away from protected routes -> /login
///   - authenticated users away from /login and /register -> /dashboard
///
/// The analysis tools (symptom/image checker, first aid, doctor locator,
/// emergency) are PUBLIC so guests can use them; only /dashboard and /history
/// require a signed-in user.
class AppRouter {
  AppRouter._();

  static final ValueNotifier<User?> _userNotifier = ValueNotifier(null);

  static Listenable get refreshListenable => _userNotifier;

  /// Routes a guest may open without signing in.
  static const Set<String> _publicRoutes = {
    '/',
    '/splash',
    '/symptom-checker',
    '/image-checker',
    '/first-aid',
    '/doctor-locator',
    '/emergency',
    '/results',
  };

  /// Call once after Firebase init.
  static void init() {
    FirebaseAuth.instance.authStateChanges().listen(
      (u) => _userNotifier.value = u,
    );
  }

  static final GoRouter appRouter = GoRouter(
    initialLocation: '/splash',
    refreshListenable: refreshListenable,
    redirect: (context, state) {
      final loggedIn = _userNotifier.value != null;
      final loc = state.matchedLocation;
      final isAuthRoute = loc == '/login' || loc == '/register';
      final isProtected = !_publicRoutes.contains(loc) && !isAuthRoute;

      if (!loggedIn && isProtected) return '/login';
      if (loggedIn && isAuthRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/symptom-checker',
        name: 'symptomChecker',
        builder: (context, state) => const SymptomCheckerScreen(),
      ),
      GoRoute(
        path: '/image-checker',
        name: 'imageChecker',
        builder: (context, state) => const ImageCheckerScreen(),
      ),
      GoRoute(
        path: '/first-aid',
        name: 'firstAid',
        builder: (context, state) => const FirstAidScreen(),
      ),
      GoRoute(
        path: '/doctor-locator',
        name: 'doctorLocator',
        builder: (context, state) => const DoctorLocatorScreen(),
      ),
      GoRoute(
        path: '/emergency',
        name: 'emergency',
        builder: (context, state) => const EmergencyScreen(),
      ),
      GoRoute(
        path: '/history',
        name: 'history',
        builder: (context, state) => const HistoryScreen(),
      ),
      GoRoute(
        path: '/results',
        name: 'results',
        builder: (context, state) {
          final result = state.extra;
          if (result is PredictionResult) return ResultsScreen(result: result);
          return const ComingSoonScreen(title: 'Results');
        },
      ),
    ],
  );
}

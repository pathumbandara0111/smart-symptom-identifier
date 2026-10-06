import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide User;

import '../services/ai_service.dart';
import '../services/auth_service.dart';
import '../services/gemini_service.dart';
import '../services/kaggle_service.dart';
import '../services/location_service.dart';
import '../services/supabase_service.dart';

/// Singleton Supabase client (DB only; authentication stays on Firebase).
final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

/// Singleton Firebase Auth instance.
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

/// Auth service provider.
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(firebaseAuthProvider));
});

/// Supabase service provider.
final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  return SupabaseService(ref.watch(supabaseProvider));
});

final dioProvider = Provider<Dio>((ref) => Dio());

final kaggleServiceProvider = Provider<KaggleService>((ref) {
  return KaggleService(ref.watch(dioProvider));
});

final geminiServiceProvider = Provider<GeminiService>((ref) => GeminiService());

final locationServiceProvider = Provider<LocationService>(
  (ref) => LocationService(),
);

final aiServiceProvider = Provider<AiService>((ref) {
  return AiService(
    ref.watch(kaggleServiceProvider),
    ref.watch(geminiServiceProvider),
  );
});

/// Tracks the current Firebase user over time (likened to the webapp's session).
final authStateProvider = StreamProvider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).authStateChanges();
});

/// When a sync build needs the firebase user id.
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).currentUser;
});

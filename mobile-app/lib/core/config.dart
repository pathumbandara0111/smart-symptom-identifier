import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Central configuration for app-wide constants and secrets.
///
/// Reads from `assets/.env` (via flutter_dotenv) with hardcoded fallbacks so the
/// app builds even when the env file is absent. NOTE: for a fully standalone app
/// these values ship inside the APK (parity with the web front-end).
class AppConfig {
  AppConfig._();

  static String _read(String key, String fallback) {
    final v = dotenv.maybeGet(key);
    return (v == null || v.isEmpty) ? fallback : v;
  }

  // --- Gemini ---
  static String get geminiKey =>
      _read('GEMINI_API_KEY', 'AIzaSyBqGOVszswnR2xq3VX0t9IM3ejyH1jeL5Q');

  // --- Kaggle custom model (ngrok) ---
  static String get kaggleBaseUrl => _read(
    'KAGGLE_API_URL',
    'https://rice-elixir-hungrily.ngrok-free.dev',
  ).replaceAll(RegExp(r'/$'), '');

  // --- Supabase (DB only; auth stays on Firebase) ---
  static String get supabaseUrl =>
      _read('SUPABASE_URL', 'https://zasgeycijbbxxgrcksie.supabase.co');
  static String get supabaseAnonKey => _read(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphc2dleWNpamJieHhncmNrc2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTI3MjgsImV4cCI6MjA5MTkyODcyOH0.M8c8z99tin6MY5WwPmmpcPfl5jH_mDMWUnI9KWp9CTQ',
  );

  // --- Firebase (Web client ID used to identify Google sign-in) ---
  static String get firebaseProjectId =>
      _read('FIREBASE_PROJECT_ID', 'smart-symptom-identifier');

  // --- Google Maps ---
  static String get googleMapsKey =>
      _read('GOOGLE_MAPS_API_KEY', 'AIzaSyBxKW1jC3g7SnjMwwDEEnWDYDGylLv91Bc');
}

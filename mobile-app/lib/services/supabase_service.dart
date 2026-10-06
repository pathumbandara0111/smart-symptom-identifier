import 'dart:math';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/doctor.dart';
import '../models/hospital.dart';
import '../models/illness.dart';
import '../models/prediction_result.dart';
import '../models/profile.dart';
import '../models/symptom_session.dart';

/// Supabase database access (DB only — auth stays on Firebase).
///
/// The live project DB uses the webapp's Prisma schema, so tables are
/// PascalCase (`Illness`, `Hospital`, `Doctor`, `User`, `SymptomSession`,
/// `Feedback`) and columns are camelCase.
class SupabaseService {
  SupabaseService(this._client);

  final SupabaseClient _client;

  /// Random UUID-ish string used where the DB has `id text` (Prisma cuid style)
  /// with no server-side default.
  static String _uuid() {
    final r = Random();
    final bytes = List.generate(16, (_) => r.nextInt(256));
    final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}'
        '-${hex.substring(16, 20)}-${hex.substring(20)}';
  }

  /// Resolves a Firebase user's `email` to a row in the Prisma `User` table
  /// (keyed by email, unique), creating it if the user has never synced before.
  /// Firebase remains the auth authority; the DB `password` is a placeholder.
  Future<String> _ensureUserId({required String email, String? name}) async {
    final rows = await _client
        .from('User')
        .select('id, name')
        .eq('email', email)
        .limit(1);
    final now = DateTime.now().toUtc().toIso8601String();
    if (rows.isNotEmpty) {
      final id = rows.first['id'] as String;
      final currentName = rows.first['name'] as String? ?? '';
      if (name != null && name.isNotEmpty && name != currentName) {
        await _client
            .from('User')
            .update({'name': name, 'updatedAt': now})
            .eq('email', email);
      }
      return id;
    }
    final id = _uuid();
    await _client.from('User').insert({
      'id': id,
      'name': name ?? '',
      'email': email,
      'password': 'firebase-auth',
      'role': 'USER',
      'createdAt': now,
      'updatedAt': now,
    });
    return id;
  }

  Future<String?> _userIdByEmail(String email) async {
    final rows = await _client
        .from('User')
        .select('id')
        .eq('email', email)
        .limit(1);
    return rows.isEmpty ? null : rows.first['id'] as String;
  }

  // --- profiles (stored in the Prisma `User` table, keyed by email) ---
  Future<void> upsertProfile({
    required String name,
    required String email,
  }) async {
    await _ensureUserId(email: email, name: name);
  }

  Future<Profile?> fetchProfileByEmail(String email) async {
    final rows = await _client
        .from('User')
        .select()
        .eq('email', email)
        .limit(1);
    if (rows.isEmpty) return null;
    return Profile.fromJson(rows.first);
  }

  // --- hospitals (doctor locator) ---
  Future<List<Hospital>> fetchHospitals() async {
    final rows = await _client
        .from('Hospital')
        .select('*, Doctor(*)')
        .order('name');
    return rows.map((r) => Hospital.fromJson(r)).toList();
  }

  // --- physicians (doctor locator) ---
  Future<List<Doctor>> fetchDoctors({
    String? speciality,
    String? hospitalId,
  }) async {
    var query = _client.from('Doctor').select().eq('available', true);
    if (speciality != null) query = query.eq('speciality', speciality);
    if (hospitalId != null) query = query.eq('hospitalId', hospitalId);
    final rows = await query.order('name');
    return rows.map((r) => Doctor.fromJson(r)).toList();
  }

  // --- first aid ---
  Future<List<Illness>> fetchIllnesses({String? category}) async {
    var query = _client.from('Illness').select('*, FirstAid(*)');
    if (category != null && category != 'general') {
      query = query.eq('category', category);
    }
    final rows = await query.order('name');
    return rows.map((r) => Illness.fromJson(r)).toList();
  }

  // --- history / sessions ---
  Future<void> saveSession({
    required String email,
    String? symptomText,
    String? imagePath,
    required PredictionResult prediction,
  }) async {
    final userId = await _ensureUserId(email: email);
    await _client.from('SymptomSession').insert({
      'id': _uuid(),
      'userId': userId,
      'symptomText': symptomText,
      'imagePath': imagePath,
      'aiResponse': prediction.toJson(),
      'severity': prediction.severity,
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<List<SymptomSession>> fetchSessions(String email) async {
    final userId = await _userIdByEmail(email);
    if (userId == null) return const [];
    final rows = await _client
        .from('SymptomSession')
        .select()
        .eq('userId', userId)
        .order('createdAt', ascending: false)
        .limit(20);
    return rows.map((r) => SymptomSession.fromJson(r)).toList();
  }

  Future<void> deleteSession(String sessionId) async {
    await _client.from('SymptomSession').delete().eq('id', sessionId);
  }

  // --- feedback ---
  Future<void> submitFeedback({
    required String email,
    required int rating,
    String? comment,
  }) async {
    final userId = await _ensureUserId(email: email);
    await _client.from('Feedback').insert({
      'id': _uuid(),
      'userId': userId,
      'rating': rating,
      'comment': comment,
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    });
  }
}

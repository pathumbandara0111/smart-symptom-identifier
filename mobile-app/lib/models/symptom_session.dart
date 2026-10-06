import 'prediction_result.dart';

/// Supabase `SymptomSession` row — a saved analysis for a user's history.
class SymptomSession {
  const SymptomSession({
    required this.id,
    required this.userId,
    required this.symptomText,
    required this.imagePath,
    required this.severity,
    required this.createdAt,
    this.prediction,
  });

  final String id;
  final String userId;
  final String? symptomText;
  final String? imagePath;
  final String severity;
  final DateTime? createdAt;
  final PredictionResult? prediction;

  factory SymptomSession.fromJson(Map<String, dynamic> json) {
    final aiResponse = json['aiResponse'];
    PredictionResult? pred;
    if (aiResponse is Map<String, dynamic>) {
      pred = PredictionResult.fromJson(aiResponse);
    } else if (aiResponse is Map) {
      pred = PredictionResult.fromJson(Map<String, dynamic>.from(aiResponse));
    }
    return SymptomSession(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      symptomText: json['symptomText'] as String?,
      imagePath: json['imagePath'] as String?,
      severity: json['severity'] as String? ?? 'mild',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
      prediction: pred,
    );
  }
}

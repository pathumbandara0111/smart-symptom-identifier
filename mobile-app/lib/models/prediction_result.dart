/// Result of a symptom analysis — matches the JSON contract returned by Gemini
/// and refined by the Kaggle model (mirror of webapp `PredictionResponse`).
class PredictionResult {
  const PredictionResult({
    required this.possibleIllnesses,
    required this.severity,
    required this.firstAidSteps,
    required this.specialistType,
    required this.emergencyRequired,
    required this.additionalInfo,
    required this.disclaimer,
    this.source = 'raw',
  });

  final List<String> possibleIllnesses;
  final String severity;
  final List<String> firstAidSteps;
  final String specialistType;
  final bool emergencyRequired;
  final String additionalInfo;
  final String disclaimer;

  /// 'kaggle', 'gemini', or 'raw' (raw Kaggle fallback).
  final String source;

  PredictionResult copyWith({String? source}) {
    return PredictionResult(
      possibleIllnesses: possibleIllnesses,
      severity: severity,
      firstAidSteps: firstAidSteps,
      specialistType: specialistType,
      emergencyRequired: emergencyRequired,
      additionalInfo: additionalInfo,
      disclaimer: disclaimer,
      source: source ?? this.source,
    );
  }

  factory PredictionResult.fromJson(Map<String, dynamic> json) {
    return PredictionResult(
      possibleIllnesses: (json['possibleIllnesses'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      severity: json['severity'] as String? ?? 'mild',
      firstAidSteps: (json['firstAidSteps'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      specialistType: json['specialistType'] as String? ?? '',
      emergencyRequired: json['emergencyRequired'] as bool? ?? false,
      additionalInfo: json['additionalInfo'] as String? ?? '',
      disclaimer: json['disclaimer'] as String? ?? '',
      source: json['source'] as String? ?? 'raw',
    );
  }

  Map<String, dynamic> toJson() => {
    'possibleIllnesses': possibleIllnesses,
    'severity': severity,
    'firstAidSteps': firstAidSteps,
    'specialistType': specialistType,
    'emergencyRequired': emergencyRequired,
    'additionalInfo': additionalInfo,
    'disclaimer': disclaimer,
    'source': source,
  };
}

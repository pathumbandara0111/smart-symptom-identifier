import 'dart:typed_data';

import '../core/constants.dart';
import '../models/prediction_result.dart';
import 'gemini_service.dart';
import 'kaggle_service.dart';

/// Orchestrates text/image analysis: Kaggle model first, Gemini refinement,
/// then Gemini fallback (mirror of `webapp/lib/aiService.ts`).
class AiService {
  AiService(this._kaggle, this._gemini);

  final KaggleService _kaggle;
  final GeminiService _gemini;

  /// Analyze free-text symptoms.
  Future<PredictionResult> identifySymptoms(
    String symptoms, {
    String? age,
    String? gender,
  }) async {
    try {
      final illness = await _kaggle.predictText(symptoms);
      try {
        final refined = await _gemini.refineMedicalDetails(illness, symptoms);
        return refined.copyWith(source: 'kaggle');
      } catch (_) {
        // Refinement failed — fall back to the raw Kaggle response.
        return _rawKaggleResponse(illness);
      }
    } catch (_) {
      // Kaggle offline/error — use Gemini as primary.
      final geminiResult = await _gemini.analyzeTextSymptoms(
        symptoms: symptoms,
        age: age,
        gender: gender,
      );
      return geminiResult.copyWith(source: 'gemini');
    }
  }

  /// Analyze a symptom photo.
  Future<PredictionResult> identifyImage({
    required Uint8List bytes,
    required String mimeType,
    String? description,
  }) async {
    try {
      final condition = await _kaggle.predictImage(bytes);
      final fullName = AppConstants.imageCodeMap[condition] ?? condition;
      try {
        final refined = await _gemini.refineMedicalDetails(
          fullName,
          description ?? 'Visual condition',
        );
        return refined.copyWith(source: 'kaggle');
      } catch (_) {
        return _rawKaggleResponse(fullName);
      }
    } catch (_) {
      final geminiResult = await _gemini.analyzeImageSymptoms(
        bytes: bytes,
        mimeType: mimeType,
        description: description,
      );
      return geminiResult.copyWith(source: 'gemini');
    }
  }

  PredictionResult _rawKaggleResponse(String illness) {
    return PredictionResult(
      possibleIllnesses: [illness],
      severity: 'moderate',
      firstAidSteps: ['Please consult a doctor for professional advice.'],
      specialistType: 'Specialist',
      emergencyRequired: false,
      additionalInfo: 'Custom AI Analysis Complete.',
      disclaimer: 'Not medical advice.',
      source: 'raw',
    );
  }
}

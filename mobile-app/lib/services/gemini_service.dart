import 'dart:convert';
import 'dart:typed_data';

import 'package:google_generative_ai/google_generative_ai.dart';

import '../core/config.dart';
import '../models/prediction_result.dart';

/// Google Gemini caller — mirrors `webapp/lib/gemini.ts`.
class GeminiService {
  GeminiService();

  static const String _medicalSystemPrompt = '''
You are a compassionate and knowledgeable medical information assistant in the "Smart Symptom Identifier" app.

Your role:
1. Analyze user-described symptoms (text or image) and suggest POSSIBLE illnesses
2. Provide verified first-aid steps for the identified condition
3. Identify if symptoms are CRITICAL and require immediate emergency help
4. Recommend the type of specialist the user should see

CRITICAL RULES - ALWAYS follow these:
- ALWAYS add this notice at the end: "This is not a substitute for professional medical advice. Please consult a qualified doctor."
- For CRITICAL symptoms (severe chest pain, difficulty breathing, severe bleeding, stroke signs, high fever >39C in children, unconsciousness, severe burns), set emergencyRequired to TRUE and put EMERGENCY as first illness.
- Use SIMPLE language - avoid medical jargon.
- Be calm, warm, and supportive in tone.
- Maximum 4-5 first-aid steps, keep them short and clear.
- NEVER recommend specific drug names or dosages.
- Always mention to seek professional medical help.

Severity levels:
- "mild" = minor discomfort, manageable at home
- "moderate" = needs attention, see a doctor within 1-2 days
- "severe" = urgent care needed today
- "critical" = EMERGENCY, call an ambulance immediately

Respond ONLY with valid JSON matching this exact format:
{
  "possibleIllnesses": ["Most Likely Illness", "Second Possibility"],
  "severity": "mild | moderate | severe | critical",
  "firstAidSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "specialistType": "Type of doctor to see",
  "emergencyRequired": false,
  "additionalInfo": "Brief extra helpful information",
  "disclaimer": "This is not a substitute for professional medical advice. Please consult a qualified doctor."
}
''';

  GenerativeModel _model() {
    return GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: AppConfig.geminiKey,
      systemInstruction: Content.text(_medicalSystemPrompt),
    );
  }

  /// Analyze text-described symptoms.
  Future<PredictionResult> analyzeTextSymptoms({
    required String symptoms,
    String? age,
    String? gender,
  }) async {
    final prompt =
        '''
Patient Information:
- Age Group: ${age ?? 'Not specified'}
- Gender: ${gender ?? 'Not specified'}
- Described Symptoms: $symptoms

Please analyze these symptoms carefully and respond in the required JSON format only.
''';
    final response = await _model().generateContent([Content.text(prompt)]);
    return _parse(response.text ?? '');
  }

  /// Analyze an uploaded symptom image.
  Future<PredictionResult> analyzeImageSymptoms({
    required Uint8List bytes,
    required String mimeType,
    String? description,
  }) async {
    final textPart = TextPart(
      'The user has uploaded an image of a visible symptom.\n'
      'Additional description from the user: "${description ?? 'No additional description provided.'}"\n'
      'Please analyze the visible symptom in this image carefully and respond in the required JSON format only.',
    );
    final imagePart = DataPart(mimeType, bytes);
    final response = await _model().generateContent([
      Content.multi([textPart, imagePart]),
    ]);
    return _parse(response.text ?? '');
  }

  /// Refine a Kaggle diagnosis into full medical details (mirror of
  /// `getRefinedMedicalDetails` in the webapp).
  Future<PredictionResult> refineMedicalDetails(
    String illness,
    String context,
  ) async {
    final prompt =
        '''
Our custom model identified this condition: "$illness"
User symptoms/context: "$context"

Translate "$illness" to its full medical name if it is a code (like nv, mel, bcc).
Then generate a professional medical response in EXACT JSON format:
{
  "possibleIllnesses": ["Full Name of $illness"],
  "severity": "mild/moderate/severe/critical",
  "firstAidSteps": ["Step 1", "Step 2", "Step 3"],
  "specialistType": "Type of doctor",
  "emergencyRequired": true/false,
  "additionalInfo": "Brief explanation of the condition",
  "disclaimer": "This is not a substitute for professional medical advice."
}
''';
    final response = await _model().generateContent([Content.text(prompt)]);
    return _parse(response.text ?? '');
  }

  PredictionResult _parse(String raw) {
    final match = RegExp(r'\{[\s\S]*\}').firstMatch(raw);
    if (match == null) {
      throw Exception('Invalid AI response format');
    }
    final json = jsonDecode(match.group(0)!);
    return PredictionResult.fromJson(Map<String, dynamic>.from(json as Map));
  }
}

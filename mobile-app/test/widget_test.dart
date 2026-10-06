import 'package:flutter_test/flutter_test.dart';

import 'package:smart_symptom_ai/core/constants.dart';
import 'package:smart_symptom_ai/models/prediction_result.dart';

void main() {
  test('severityLabel maps known severities', () {
    expect(AppConstants.severityLabel('mild'), 'Mild');
    expect(AppConstants.severityLabel('moderate'), 'Moderate');
    expect(AppConstants.severityLabel('severe'), 'Severe');
    expect(AppConstants.severityLabel('critical'), 'Critical');
  });

  test('imageCodeMap contains HAM10000 codes', () {
    expect(AppConstants.imageCodeMap['mel'], 'Melanoma');
    expect(AppConstants.imageCodeMap['nv'], 'Melanocytic nevi (Mole)');
  });

  test('emergencyNumbers exposes ambulance line', () {
    expect(AppConstants.emergencyNumbers['Ambulance (Suwa Seriya)'], '1990');
  });

  test('PredictionResult.fromJson parses a Gemini response', () {
    final json = {
      'possibleIllnesses': ['Common Cold', 'Flu'],
      'severity': 'moderate',
      'firstAidSteps': ['Rest', 'Hydrate'],
      'specialistType': 'General Physician',
      'emergencyRequired': false,
      'additionalInfo': 'Extra info',
      'disclaimer': 'Not medical advice.',
      'source': 'gemini',
    };
    final r = PredictionResult.fromJson(json);
    expect(r.possibleIllnesses, contains('Common Cold'));
    expect(r.severity, 'moderate');
    expect(r.firstAidSteps.length, 2);
    expect(r.emergencyRequired, isFalse);
    expect(r.source, 'gemini');
    expect(r.toJson()['severity'], 'moderate');
  });
}
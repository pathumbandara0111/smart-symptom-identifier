/// Shared app-wide constants: severity labels, categories, emergency numbers.
class AppConstants {
  AppConstants._();

  static const int symptomMaxChars = 500;

  static const List<String> ageGroups = [
    'Under 12',
    '13-17',
    '18-25',
    '26-35',
    '36-50',
    'Over 50',
  ];

  static const List<String> genders = ['Male', 'Female', 'Other'];

  // Mirror of webapp first-aid categories.
  static const List<String> firstAidCategories = [
    'general',
    'respiratory',
    'injuries',
    'digestive',
    'allergies',
    'emergency',
  ];

  /// Sri Lankan emergency numbers used on the Emergency screen.
  static const Map<String, String> emergencyNumbers = {
    'Ambulance (Suwa Seriya)': '1990',
    'Police': '119',
    'Fire': '110',
    'Accident Service (Colombo)': '011-2691111',
  };

  static String severityLabel(String severity) {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'Critical';
      case 'severe':
        return 'Severe';
      case 'moderate':
        return 'Moderate';
      case 'mild':
      default:
        return 'Mild';
    }
  }

  /// HAM10000 skin-condition codes -> full names (mirrors webapp aiService.ts).
  static const Map<String, String> imageCodeMap = {
    'akiec': 'Actinic keratoses',
    'bcc': 'Basal cell carcinoma',
    'bkl': 'Benign keratosis-like lesions',
    'df': 'Dermatofibroma',
    'mel': 'Melanoma',
    'nv': 'Melanocytic nevi (Mole)',
    'vasc': 'Vascular lesions',
  };
}

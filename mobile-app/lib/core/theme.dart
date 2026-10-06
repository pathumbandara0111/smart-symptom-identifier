import 'package:flutter/material.dart';

/// Brand palette mirrored from the webapp (SmartSymptom AI).
abstract class AppColors {
  static const Color cyan = Color(0xFF00B4D8);
  static const Color lightCyan = Color(0xFF90E0EF);
  static const Color paleCyan = Color(0xFFCAF0F8);
  static const Color teal = Color(0xFF00CFE8);
  static const Color green = Color(0xFF06D6A0);
  static const Color amber = Color(0xFFFFD166);
  static const Color red = Color(0xFFEF476F);
  static const Color deepBlue = Color(0xFF0077B6);

  // Dark glass background tones.
  static const Color bg = Color(0xFF0B0F1A);
  static const Color surface = Color(0xFF131A2A);
  static const Color border = Color(0x2EFFFFFF);

  static const Color textPrimary = Color(0xFFF0F6FF);
  static const Color textSecondary = Color(0xFFB8C4DC);
  static const Color textMuted = Color(0xFF7A87A6);
}

/// Severity -> visual color (matches webapp's getSeverityColor semantics).
Color severityColor(String severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return AppColors.red;
    case 'severe':
      return Colors.deepOrange.shade400;
    case 'moderate':
      return AppColors.amber;
    case 'mild':
    default:
      return AppColors.green;
  }
}

ThemeData buildAppTheme(Brightness brightness) {
  final isDark = brightness != Brightness.light;
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    scaffoldBackgroundColor: isDark ? AppColors.bg : const Color(0xFFF3F7FF),
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.cyan,
      brightness: brightness,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: isDark ? AppColors.bg : const Color(0xFFF3F7FF),
      foregroundColor: isDark ? AppColors.textPrimary : const Color(0xFF0B1526),
      elevation: 0,
      centerTitle: false,
    ),
    cardTheme: CardThemeData(
      color: isDark ? AppColors.surface : Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isDark ? AppColors.border : const Color(0x22000000),
        ),
      ),
      margin: EdgeInsets.zero,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.cyan,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      ),
    ),
    textTheme: ThemeData.dark().textTheme.apply(
      bodyColor: isDark ? AppColors.textPrimary : const Color(0xFF0B1526),
      displayColor: isDark ? AppColors.textPrimary : const Color(0xFF0B1526),
    ),
  );
}

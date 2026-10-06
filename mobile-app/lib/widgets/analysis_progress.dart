import 'package:flutter/material.dart';

import '../core/theme.dart';

/// Full loading state shown while the AI analyzes symptoms/photo. Includes a
/// cancel action so the user is never stuck on a slow request; error/retry is
/// handled in the caller via `AppError`.
class AnalysisProgressView extends StatelessWidget {
  const AnalysisProgressView({
    super.key,
    this.title = 'AI is analyzing your symptoms...',
    this.subtitle = 'This usually takes a few seconds.',
    this.onCancel,
  });

  final String title;
  final String subtitle;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Center(
              child: CircularProgressIndicator(color: AppColors.cyan),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textMuted),
            ),
            const SizedBox(height: 32),
            if (onCancel != null)
              OutlinedButton.icon(
                onPressed: onCancel,
                icon: const Icon(Icons.cancel),
                label: const Text('Cancel'),
              ),
          ],
        ),
      ),
    );
  }
}

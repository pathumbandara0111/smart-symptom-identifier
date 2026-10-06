import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';
import '../../models/prediction_result.dart';
import '../../widgets/analysis_progress.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/state_views.dart';

class SymptomCheckerScreen extends ConsumerStatefulWidget {
  const SymptomCheckerScreen({super.key});

  @override
  ConsumerState<SymptomCheckerScreen> createState() =>
      _SymptomCheckerScreenState();
}

class _SymptomCheckerScreenState extends ConsumerState<SymptomCheckerScreen> {
  final _controller = TextEditingController();
  String _age = AppConstants.ageGroups[2];
  String _gender = AppConstants.genders[0];
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _analyze() async {
    final text = _controller.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe your symptoms.')),
      );
      return;
    }
    if (!mounted) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await ref
          .read(aiServiceProvider)
          .identifySymptoms(text, age: _age, gender: _gender);
      await _save(result, text);
      if (mounted) context.push('/results', extra: result);
    } catch (e) {
      if (mounted)
        setState(() => _error = 'Analysis failed. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _cancel() {
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = null;
    });
  }

  Future<void> _save(PredictionResult result, String text) async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    try {
      await ref
          .read(supabaseServiceProvider)
          .saveSession(
            email: user.email ?? '',
            symptomText: text,
            prediction: result,
          );
    } catch (_) {
      // History save is best-effort — analysis still succeeds.
    }
  }

  @override
  Widget build(BuildContext context) {
    final textLen = _controller.text.length;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Check Symptoms'),
        actions: const [AuthAvatar()],
      ),
      body: SafeArea(
        child: _busy
            ? AnalysisProgressView(
                title: 'AI is analyzing your symptoms...',
                subtitle:
                    'Cross-checking the custom model and refining the result. Please wait.',
                onCancel: _cancel,
              )
            : _error != null
            ? AppError(message: _error!, onRetry: _analyze)
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(
                    'Describe your symptoms in plain language and get AI-powered predictions.',
                    style: TextStyle(color: AppColors.textMuted, height: 1.5),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _controller,
                    maxLines: 6,
                    maxLength: AppConstants.symptomMaxChars,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText:
                          'e.g. I have a persistent headache, fever and fatigue for the past 3 days...',
                      border: const OutlineInputBorder(),
                      counterText: '$textLen / ${AppConstants.symptomMaxChars}',
                    ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    initialValue: _age,
                    decoration: const InputDecoration(
                      labelText: 'Age group',
                      border: OutlineInputBorder(),
                    ),
                    items: AppConstants.ageGroups
                        .map((a) => DropdownMenuItem(value: a, child: Text(a)))
                        .toList(),
                    onChanged: (v) => setState(() => _age = v ?? _age),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    initialValue: _gender,
                    decoration: const InputDecoration(
                      labelText: 'Gender',
                      border: OutlineInputBorder(),
                    ),
                    items: AppConstants.genders
                        .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                        .toList(),
                    onChanged: (v) => setState(() => _gender = v ?? _gender),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _busy ? null : _analyze,
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _busy
                        ? const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                              SizedBox(width: 12),
                              Text('Analyzing...'),
                            ],
                          )
                        : const Text('Analyze Symptoms'),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '⚠️ For informational purposes only. Not a substitute for professional medical advice.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ],
              ),
      ),
    );
  }
}

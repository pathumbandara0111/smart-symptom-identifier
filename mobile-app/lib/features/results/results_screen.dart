import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/constants.dart';
import '../../core/providers.dart';
import '../../core/theme.dart';
import '../../models/prediction_result.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/severity_badge.dart';

class ResultsScreen extends ConsumerStatefulWidget {
  const ResultsScreen({super.key, required this.result});

  final PredictionResult result;

  @override
  ConsumerState<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends ConsumerState<ResultsScreen> {
  int _rating = 0;
  final _comment = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    if (_rating == 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a rating.')));
      return;
    }
    setState(() => _submitting = true);
    try {
      await ref
          .read(supabaseServiceProvider)
          .submitFeedback(
            email: user.email ?? '',
            rating: _rating,
            comment: _comment.text.trim().isEmpty ? null : _comment.text.trim(),
          );
      if (mounted) setState(() => _submitted = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not submit feedback: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _share() async {
    final r = widget.result;
    final lines = <String>[
      'SmartSymptom AI — Analysis Result',
      '',
      'Severity: ${AppConstants.severityLabel(r.severity)}',
      if (r.possibleIllnesses.isNotEmpty)
        'Possible illnesses: ${r.possibleIllnesses.join(", ")}',
      if (r.specialistType.isNotEmpty) 'See a: ${r.specialistType}',
      if (r.emergencyRequired) '⚠️ EMERGENCY — call 1990 (Suwa Seriya)',
      if (r.firstAidSteps.isNotEmpty)
        'First aid: ${r.firstAidSteps.join(" • ")}',
      if (r.additionalInfo.isNotEmpty) 'Info: ${r.additionalInfo}',
      '',
      r.disclaimer,
    ];
    try {
      await SharePlus.instance.share(ShareParams(text: lines.join('\n')));
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.result;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analysis Result'),
        actions: [
          IconButton(
            tooltip: 'Share result',
            icon: const Icon(Icons.share),
            onPressed: _share,
          ),
          const AuthAvatar(),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (r.emergencyRequired) ...[
            _EmergencyBanner(),
            const SizedBox(height: 16),
          ],
          Row(
            children: [
              SeverityBadge(severity: r.severity),
              const Spacer(),
              _SourceChip(source: r.source),
            ],
          ),
          const SizedBox(height: 20),
          _SectionTitle('Possible illnesses'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: r.possibleIllnesses
                .map(
                  (ill) => Chip(
                    label: Text(ill),
                    backgroundColor: AppColors.cyan.withValues(alpha: 0.15),
                    side: BorderSide(
                      color: AppColors.cyan.withValues(alpha: 0.4),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                )
                .toList(),
          ),
          if (r.specialistType.isNotEmpty) ...[
            const SizedBox(height: 20),
            GlassCard(
              child: Row(
                children: [
                  const Icon(Icons.medical_information, color: AppColors.cyan),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'See a',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                        Text(
                          r.specialistType,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (r.firstAidSteps.isNotEmpty) ...[
            const SizedBox(height: 20),
            _SectionTitle('First aid steps'),
            const SizedBox(height: 8),
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(r.firstAidSteps.length, (i) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundColor: AppColors.green,
                          child: Text(
                            '${i + 1}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(child: Text(r.firstAidSteps[i])),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ],
          if (r.additionalInfo.isNotEmpty) ...[
            const SizedBox(height: 20),
            _SectionTitle('Additional info'),
            const SizedBox(height: 8),
            GlassCard(child: Text(r.additionalInfo)),
          ],
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => context.push('/doctor-locator'),
            icon: const Icon(Icons.map),
            label: const Text('Find a doctor nearby'),
          ),
          const SizedBox(height: 20),
          Text(
            r.disclaimer,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 28),
          _SectionTitle('Was this helpful?'),
          const SizedBox(height: 8),
          GlassCard(
            child: _submitted
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle, color: AppColors.green),
                        SizedBox(width: 8),
                        Text('Thank you for your feedback!'),
                      ],
                    ),
                  )
                : Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(5, (i) {
                          return IconButton(
                            icon: Icon(
                              i < _rating ? Icons.star : Icons.star_border,
                              color: AppColors.amber,
                              size: 30,
                            ),
                            onPressed: () => setState(() => _rating = i + 1),
                          );
                        }),
                      ),
                      TextField(
                        controller: _comment,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          hintText: 'Add a comment (optional)',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: _submitting ? null : _submitFeedback,
                        child: _submitting
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Submit feedback'),
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _EmergencyBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.red.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.red.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber, color: AppColors.red, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Emergency required',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.red,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Call 1990 (Suwa Seriya) or seek immediate medical help.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
    );
  }
}

class _SourceChip extends StatelessWidget {
  const _SourceChip({required this.source});
  final String source;

  @override
  Widget build(BuildContext context) {
    final label = switch (source) {
      'kaggle' => 'Custom AI',
      'gemini' => 'Gemini AI',
      _ => 'AI',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
      ),
    );
  }
}

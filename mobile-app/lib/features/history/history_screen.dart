import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme.dart';
import '../../models/symptom_session.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/severity_badge.dart';
import '../../widgets/state_views.dart';

final historyProvider = FutureProvider.family<List<SymptomSession>, String>((
  ref,
  email,
) {
  return ref.watch(supabaseServiceProvider).fetchSessions(email);
});

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final service = ref.watch(supabaseServiceProvider);
    final AsyncValue<List<SymptomSession>> sessions = user == null
        ? const AsyncValue.data([])
        : ref.watch(historyProvider(user.email ?? ''));

    return Scaffold(
      appBar: AppBar(
        title: const Text('History'),
        actions: const [AuthAvatar()],
      ),
      body: SafeArea(
        child: sessions.when(
          loading: () => const AppLoading(),
          error: (e, _) => AppError(
            message: 'Could not load history',
            onRetry: () {
              if (user != null)
                ref.invalidate(historyProvider(user.email ?? ''));
            },
          ),
          data: (items) {
            if (user == null) {
              return const AppEmpty(
                title: 'Please sign in',
                message: 'Sign in to view your history.',
              );
            }
            if (items.isEmpty) {
              return const AppEmpty(
                title: 'No history yet',
                message: 'Run a symptom analysis to see it here.',
                icon: Icons.history,
              );
            }
            return RefreshIndicator(
              onRefresh: () async =>
                  ref.invalidate(historyProvider(user.email ?? '')),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final s = items[i];
                  return _SessionCard(
                    session: s,
                    onDelete: () async {
                      try {
                        await service.deleteSession(s.id);
                        ref.invalidate(historyProvider(user.email ?? ''));
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Could not delete: $e')),
                          );
                        }
                      }
                    },
                    onTap: () {
                      if (s.prediction != null)
                        context.push('/results', extra: s.prediction!);
                    },
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({
    required this.session,
    required this.onDelete,
    required this.onTap,
  });

  final SymptomSession session;
  final VoidCallback onDelete;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final illnesses = session.prediction?.possibleIllnesses ?? <String>[];
    final text = session.symptomText;
    final date = session.createdAt;

    return GlassCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SeverityBadge(severity: session.severity),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.delete_outline, size: 20),
                onPressed: onDelete,
              ),
            ],
          ),
          if (text != null && text.isNotEmpty) ...[
            Text(text, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
          ],
          if (illnesses.isNotEmpty)
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: illnesses
                  .take(3)
                  .map(
                    (t) => Chip(
                      label: Text(
                        t,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      backgroundColor: AppColors.surface,
                      side: const BorderSide(color: AppColors.border),
                    ),
                  )
                  .toList(),
            ),
          if (date != null) ...[
            const SizedBox(height: 8),
            Text(
              DateFormat.yMMMd().add_jm().format(date),
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

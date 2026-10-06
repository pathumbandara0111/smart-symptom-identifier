import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/glass_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final name = user?.displayName ?? '';
    final greeting = name.isEmpty ? 'Hello' : 'Hello, $name';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: const [AuthAvatar()],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              greeting,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            Text(
              user?.email ?? '',
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(
                  context,
                ).colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Quick actions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.25,
              children: [
                _ActionCard(
                  icon: Icons.search,
                  label: 'Check Symptoms',
                  route: '/symptom-checker',
                  color: const Color(0xFF00B4D8),
                ),
                _ActionCard(
                  icon: Icons.photo_camera,
                  label: 'Upload Photo',
                  route: '/image-checker',
                  color: const Color(0xFF00CFE8),
                ),
                _ActionCard(
                  icon: Icons.history,
                  label: 'History',
                  route: '/history',
                  color: const Color(0xFF90E0EF),
                ),
                _ActionCard(
                  icon: Icons.medical_services,
                  label: 'First Aid',
                  route: '/first-aid',
                  color: const Color(0xFF06D6A0),
                ),
                _ActionCard(
                  icon: Icons.map,
                  label: 'Find Doctors',
                  route: '/doctor-locator',
                  color: const Color(0xFFFFD166),
                ),
                _ActionCard(
                  icon: Icons.phone,
                  label: 'Emergency',
                  route: '/emergency',
                  color: const Color(0xFFEF476F),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.route,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String route;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: () => context.push(route),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 30, color: color),
          const Spacer(),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          ),
        ],
      ),
    );
  }
}

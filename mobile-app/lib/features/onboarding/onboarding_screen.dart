import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../widgets/auth_avatar.dart';
import '../../widgets/exit_confirmation.dart';
import '../../widgets/glass_card.dart';

/// Landing/onboarding screen (web parity: "/"). Entry points into the
/// analysis tools, first aid, doctor locator and emergency call.
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ExitConfirmation(
      child: Scaffold(
        appBar: AppBar(actions: const [AuthAvatar()]),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                Image.asset('assets/images/logo.png', width: 120, height: 120),
                const SizedBox(height: 16),
                const Text(
                  'Smart Symptom Identifier',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  'AI-powered health assistant that identifies possible illnesses, provides first-aid guidance, and connects you with nearby doctors — instantly.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 15,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 32),
                FilledButton.icon(
                  onPressed: () => context.push('/symptom-checker'),
                  icon: const Icon(Icons.search),
                  label: const Text('Check Symptoms'),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => context.push('/emergency'),
                  icon: const Icon(Icons.phone),
                  label: const Text('Emergency — Call 1990'),
                  style: FilledButton.styleFrom(backgroundColor: AppColors.red),
                ),
                const SizedBox(height: 24),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.1,
                  children: [
                    _FeatureTile(
                      icon: Icons.search,
                      label: 'Check Symptoms',
                      color: AppColors.cyan,
                      onTap: () => context.push('/symptom-checker'),
                    ),
                    _FeatureTile(
                      icon: Icons.photo_camera,
                      label: 'Upload Photo',
                      color: AppColors.teal,
                      onTap: () => context.push('/image-checker'),
                    ),
                    _FeatureTile(
                      icon: Icons.medical_services,
                      label: 'First Aid',
                      color: AppColors.green,
                      onTap: () => context.push('/first-aid'),
                    ),
                    _FeatureTile(
                      icon: Icons.map,
                      label: 'Find Doctors',
                      color: AppColors.amber,
                      onTap: () => context.push('/doctor-locator'),
                    ),
                  ],
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
        ),
      ),
    );
  }
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/providers.dart';
import '../core/theme.dart';

/// Top-right app bar widget shown on every page:
///   - signed out: a "Login" button that routes to the login page.
///   - signed in: the user's Google profile photo (or avatar placeholder) with
///     a menu containing Sign out and Dashboard.
class AuthAvatar extends ConsumerWidget {
  const AuthAvatar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncUser = ref.watch(authStateProvider);
    final user = asyncUser.value;

    if (asyncUser.isLoading) return const SizedBox.shrink();
    if (user == null) {
      return Padding(
        padding: const EdgeInsets.only(right: 8),
        child: OutlinedButton.icon(
          onPressed: () => context.push('/login'),
          icon: const Icon(Icons.login, size: 18),
          label: const Text('Login'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textPrimary,
            side: const BorderSide(color: AppColors.cyan),
            visualDensity: VisualDensity.compact,
          ),
        ),
      );
    }

    return PopupMenuButton<String>(
      tooltip: user.email,
      offset: const Offset(0, 44),
      color: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      onSelected: (v) async {
        if (v == 'signout') {
          await ref.read(authServiceProvider).signOut();
          if (context.mounted) context.go('/');
        } else if (v == 'dashboard') {
          context.push('/dashboard');
        }
      },
      itemBuilder: (context) => const [
        PopupMenuItem(value: 'dashboard', child: Text('Dashboard')),
        PopupMenuItem(value: 'signout', child: Text('Sign out')),
      ],
      child: _avatar(user),
    );
  }

  Widget _avatar(User user) {
    final photo = user.photoURL;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: CircleAvatar(
        radius: 16,
        backgroundColor: AppColors.surface,
        backgroundImage: (photo != null && photo.isNotEmpty)
            ? NetworkImage(photo)
            : null,
        child: (photo == null || photo.isEmpty)
            ? const Icon(Icons.person, size: 18)
            : null,
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../core/theme.dart';

/// A frosted "glass" card matching the webapp's glass-card look.
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(20),
    this.color,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final box = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? (isDark ? AppColors.surface : Colors.white),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.border : const Color(0x22000000),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.06),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );

    if (onTap == null) return box;
    return GestureDetector(onTap: onTap, child: box);
  }
}

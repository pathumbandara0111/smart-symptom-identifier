import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Wraps a home screen so the Android back button doesn't instantly close the
/// app. First back press shows "press back again to exit"; a second press
/// within the window actually pops/exits.
class ExitConfirmation extends StatefulWidget {
  const ExitConfirmation({super.key, required this.child});

  final Widget child;

  @override
  State<ExitConfirmation> createState() => _ExitConfirmationState();
}

class _ExitConfirmationState extends State<ExitConfirmation> {
  DateTime? _lastBackPressed;
  bool get _canPop => Navigator.of(context).canPop();

  @override
  Widget build(BuildContext context) {
    return PopScope<void>(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_canPop) {
          Navigator.of(context).pop();
          return;
        }
        final now = DateTime.now();
        if (_lastBackPressed == null ||
            now.difference(_lastBackPressed!) > const Duration(seconds: 2)) {
          _lastBackPressed = now;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Press back again to exit'),
              duration: Duration(seconds: 2),
            ),
          );
        } else {
          SystemNavigator.pop();
        }
      },
      child: widget.child,
    );
  }
}

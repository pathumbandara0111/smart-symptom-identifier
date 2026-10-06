import 'package:flutter/material.dart';

import 'core/theme.dart';
import 'router.dart';

class SmartSymptomApp extends StatelessWidget {
  const SmartSymptomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SmartSymptom AI',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(Brightness.dark),
      darkTheme: buildAppTheme(Brightness.dark),
      routerConfig: AppRouter.appRouter,
    );
  }
}

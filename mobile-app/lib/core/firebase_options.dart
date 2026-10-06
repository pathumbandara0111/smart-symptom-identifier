import 'package:firebase_core/firebase_core.dart';

/// Firebase options for the Flutter app.
///
/// The project only exposes the web-app Firebase config (see webapp/lib/firebase.ts
/// and Docs/Firebase.txt), so we initialize via explicit `FirebaseOptions`.
///
/// IMPORTANT (Android Google sign-in): `google_sign_in` on Android needs the
/// `google-services.json` (with that app's Android OAuth client). Until that file is
/// added, email/password auth works, but Google sign-in will surface an error.
class DefaultFirebaseOptions {
  DefaultFirebaseOptions._();

  static FirebaseOptions get current => const FirebaseOptions(
    apiKey: 'AIzaSyAKy2OMZ8pG_DJPfgfRp9Ss7HcVvYfPHlo',
    appId: '1:1052339944894:android:db05c1eae64b50aa9bcdef',
    messagingSenderId: '1052339944894',
    projectId: 'smart-symptom-identifier',
    storageBucket: 'smart-symptom-identifier.firebasestorage.app',
  );

  /// Google OAuth web client id used for Google sign-in. Derived from the
  /// Android app's google-services.json (the "server_client_id" / type 3 OAuth
  /// client), which `google_sign_in`/Firebase needs to exchange the ID token.
  static String? get googleWebClientId =>
      '1052339944894-5n8jrcfuhqm7ntute2lrgmdhdqc8lcm5.apps.googleusercontent.com';
}

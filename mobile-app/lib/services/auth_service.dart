import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../core/firebase_options.dart';

/// Wraps Firebase authentication: Google sign-in + email/password, plus
/// session state. Mirrors the webapp's Firebase-based auth flow.
class AuthService {
  AuthService(this._auth);

  final FirebaseAuth _auth;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  /// Google Sign-In via Firebase credential. Returns the Firebase user, null if
  /// the user cancelled, and throws only for unexpected failures.
  ///
  /// Android is wired via `android/app/google-services.json` (the Android OAuth
  /// client type-1 entry), which the google-services Gradle plugin injects so
  /// `google_sign_in` can exchange the ID token.
  Future<User?> signInWithGoogle() async {
    final clientId = DefaultFirebaseOptions.googleWebClientId;
    final googleSignIn = clientId == null
        ? GoogleSignIn()
        : GoogleSignIn(clientId: clientId);
    final googleUser = await googleSignIn.signIn();
    if (googleUser == null) return null; // user cancelled

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final userCredential = await _auth.signInWithCredential(credential);
    return userCredential.user;
  }

  Future<User?> signInWithEmail(String email, String password) async {
    final uc = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return uc.user;
  }

  Future<User?> registerWithEmail(
    String name,
    String email,
    String password,
  ) async {
    final uc = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    await uc.user?.updateProfile(displayName: name);
    await uc.user?.reload();
    return uc.user;
  }

  /// Sends a verification email to the current user (if email not yet verified).
  Future<void> sendVerificationEmail() async {
    final user = _auth.currentUser;
    if (user != null && !user.emailVerified) {
      await user.sendEmailVerification();
    }
  }

  /// Attempts to reload the fresh token so a just-sent verification lands.
  Future<User?> reload() async {
    await _auth.currentUser?.reload();
    return _auth.currentUser;
  }

  /// Sends a password-reset email. Does not require the user to be signed in.
  Future<void> sendPasswordReset(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  Future<void> signOut() => _auth.signOut();
}

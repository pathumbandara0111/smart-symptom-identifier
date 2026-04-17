import admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing");
    }

    // Comprehensive cleaning for PEM keys
    // This handles Base64, literal \n, and actual newlines
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      // Try Base64 decode if it looks like Base64
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
      } catch (e) {
        // Not base64, carry on
      }
    }
    
    // Final sanitization: replace literal "\n" with actual newlines and remove any rogue quotes
    const sanitizedKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/"/g, '')
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: sanitizedKey,
      }),
    });
    
    console.log("✅ Firebase Admin initialized successfully");
    return admin.apps[0];
  } catch (error: any) {
    console.error("❌ Firebase admin initialization error:", error.message);
    return null;
  }
};

// Export a function to get auth instead of a constant to avoid "no-app" errors on load
export const getAdminAuth = () => {
  const app = initializeFirebaseAdmin();
  if (!app) throw new Error("Firebase Admin failed to initialize. Check your environment variables.");
  return admin.auth(app);
};

export default admin;

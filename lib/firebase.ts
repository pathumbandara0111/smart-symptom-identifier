import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwdtwWKdJsNnV1AsVrC9-h9Be50-Ix228",
  authDomain: "smart-symptom-identifier.firebaseapp.com",
  projectId: "smart-symptom-identifier",
  storageBucket: "smart-symptom-identifier.firebasestorage.app",
  messagingSenderId: "1052339944894",
  appId: "1:1052339944894:web:d44ae27cead619499bcdef"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

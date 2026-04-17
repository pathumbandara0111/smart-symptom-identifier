"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Sync with NextAuth
      const result = await nextAuthSignIn("firebase", {
        idToken,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      // 1. Sign in with Firebase Google Provider
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Sync with NextAuth
      const response = await nextAuthSignIn("firebase", {
        idToken,
        redirect: false,
      });

      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success("Signed in with Google!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🩺</div>
          <h1 style={{ fontSize: "28px", fontFamily: "Outfit", fontWeight: 800, marginBottom: "8px" }}>Welcome Back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Sign in to your SymptomAI account</p>
        </div>

        <div className="glass-card" style={{ padding: "36px" }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", marginBottom: "24px", gap: "10px", background: "rgba(255,255,255,0.05)" }}
          >
            {googleLoading ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
            Sign in with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>or email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "14px" }}
            >
              {loading ? <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--glass-border)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Don't have an account?{" "}
              <Link href="/register" style={{ color: "var(--primary-light)", fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "var(--text-muted)", opacity: 0.7 }}>
          ⚠️ SymptomAI is for informational purposes only.
        </p>
      </div>
    </div>
  );
}

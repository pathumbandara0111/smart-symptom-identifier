"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome back!");
        router.push("/symptom-checker");
        router.refresh();
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
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

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Account created! Signing you in...");

      // Auto sign in
      await signIn("credentials", { email, password, redirect: false });
      router.push("/symptom-checker");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "440px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✨</div>
          <h1 style={{ fontSize: "28px", fontFamily: "Outfit", fontWeight: 800, marginBottom: "8px" }}>Create Account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Your free SymptomAI account</p>
        </div>

        <div className="glass-card" style={{ padding: "36px" }}>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} className="form-input" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: "48px" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: "28px" }}>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "14px" }}>
              {loading ? <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Creating account...</> : "Create Free Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--glass-border)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--primary-light)", fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

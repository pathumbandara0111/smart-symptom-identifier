"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Admin access granted!");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "85vh" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 24px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", padding: "16px", borderRadius: "20px", background: "rgba(239, 71, 111, 0.1)", color: "#EF476F", marginBottom: "16px" }}>
            <ShieldAlert size={40} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Admin Portal</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to manage SmartSymptom AI infrastructure</p>
        </div>

        <div className="glass-card" style={{ padding: "32px", border: "1px solid rgba(239, 71, 111, 0.2)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Username
              </label>
              <input 
                type="text" 
                required 
                className="form-input" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password
              </label>
              <input 
                type="password" 
                required 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #EF476F, #c23152)", marginTop: "8px" }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Authenticate"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link href="/" style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none" }}>
              ← Return to Public Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

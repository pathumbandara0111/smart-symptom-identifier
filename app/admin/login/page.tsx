"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #020b18 0%, #03045e 100%)" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            background: "rgba(0, 180, 216, 0.1)", 
            borderRadius: "24px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 20px",
            border: "1px solid rgba(0, 180, 216, 0.3)",
            color: "var(--primary-light)"
          }}>
            <ShieldCheck size={40} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "white", marginBottom: "8px" }}>Admin Portal</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Authorized Personnel Only</p>
        </div>

        <div className="glass-card" style={{ padding: "32px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Username</label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
                <input 
                  required 
                  className="form-input" 
                  style={{ paddingLeft: "40px" }}
                  placeholder="Enter username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
                <input 
                  required 
                  type="password"
                  className="form-input" 
                  style={{ paddingLeft: "40px" }}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : "Secure Login"}
            </button>
          </form>
        </div>
        
        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "var(--text-muted)", opacity: 0.5 }}>
          © 2025 SymptomAI Security System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

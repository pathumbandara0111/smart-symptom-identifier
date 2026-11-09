"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Activity, Settings, Loader2, Hospital, ShieldAlert, FileText, ChevronRight, LogOut, BookOpen, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, emergencyAlerts: 0, topIllness: "..." });
  const [aiHealth, setAiHealth] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/admin/auth");
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      fetchStats();
      fetchAiHealth();
      setLoading(false);
    } catch (err) {
      router.push("/admin/login");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      toast.success("Admin logged out");
      router.push("/admin/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAiHealth() {
    try {
      const res = await fetch("/api/ai/health");
      const data = await res.json();
      if (data.success) {
        setAiHealth(data);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-[var(--primary-light)]" size={48} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", padding: "8px 16px", background: "rgba(239, 71, 111, 0.1)", borderRadius: "50px", color: "#EF476F", fontSize: "14px", fontWeight: 600, alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <ShieldAlert size={16} /> Admin Portal
            </div>
            <h1 className="page-title">System Administration</h1>
            <p className="page-subtitle" style={{ margin: 0, textAlign: "left" }}>Manage doctors, hospitals, first-aid guides, and platform AI diagnostics.</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239, 71, 111, 0.1)", color: "#EF476F", borderColor: "rgba(239, 71, 111, 0.2)" }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Management Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          <Link href="/admin/doctors" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px", transition: "transform 0.2s ease, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(0, 180, 216, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)" }}>
                <Users size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", color: "white", marginBottom: "4px" }}>Manage Doctors</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Add, edit, or remove doctors from locator.</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </Link>

          <Link href="/admin/hospitals" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px", transition: "transform 0.2s ease, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(6, 214, 160, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mild)" }}>
                <Hospital size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", color: "white", marginBottom: "4px" }}>Manage Hospitals</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Update hospital coordinates and desks.</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </Link>

          <Link href="/admin/first-aid" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px", transition: "transform 0.2s ease, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--moderate)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255, 209, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--moderate)" }}>
                <BookOpen size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", color: "white", marginBottom: "4px" }}>First Aid Guides</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Manage illnesses and action steps.</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </Link>

        </div>

        {/* AI Health Diagnostics */}
        {aiHealth && (
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "16px", paddingLeft: "8px", borderLeft: "4px solid var(--accent)" }}>
              AI Microservice Status
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--primary-light)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Cpu size={16} /> Kaggle Custom Models
                  </span>
                  <span style={{ fontSize: "12px", color: aiHealth.kaggle.online ? "var(--mild)" : "var(--severe)" }}>
                    {aiHealth.kaggle.online ? "● ONLINE" : "○ OFFLINE"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Primary DistilBERT & MobileNetV2 models. Status: {aiHealth.kaggle.detail || "Ready"}
                </p>
              </div>

              <div className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={16} /> Gemini 3.5 Flash Lite
                  </span>
                  <span style={{ fontSize: "12px", color: aiHealth.gemini.online ? "var(--mild)" : "var(--moderate)" }}>
                    {aiHealth.gemini.online ? "● ACTIVE" : "○ UNAVAILABLE"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Enriches diagnosis with first-aid steps, specialists, & automatic fallback.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Section */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", paddingLeft: "8px", borderLeft: "4px solid var(--primary-light)" }}>
            System Statistics
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", background: "rgba(255, 209, 102, 0.1)", padding: "12px", borderRadius: "50%", marginBottom: "12px", color: "var(--moderate)" }}>
                <Activity size={24} />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: "4px" }}>{stats.totalSessions}</div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Total Assessments</p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", background: "rgba(0, 119, 182, 0.1)", padding: "12px", borderRadius: "50%", marginBottom: "12px", color: "var(--primary-light)" }}>
                <FileText size={24} />
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: "4px", minHeight: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}>{stats.topIllness}</div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Top Illness</p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", background: "rgba(239, 71, 111, 0.1)", padding: "12px", borderRadius: "50%", marginBottom: "12px", color: "#EF476F" }}>
                <Settings size={24} />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: "4px" }}>{stats.emergencyAlerts}</div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Emergency Triggers</p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

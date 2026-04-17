"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Activity, Settings, Loader2, Hospital, ShieldAlert, FileText, ChevronRight, LogOut, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, emergencyAlerts: 0, topIllness: "..." });
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
        <div className="page-header" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "inline-flex", padding: "8px 16px", background: "rgba(239, 71, 111, 0.1)", borderRadius: "50px", color: "#EF476F", fontSize: "14px", fontWeight: 600, alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <ShieldAlert size={16} /> Admin Portal
            </div>
            <h1 className="page-title">System Administration</h1>
            <p className="page-subtitle">Manage doctors, hospitals, and view platform statistics.</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239, 71, 111, 0.1)", color: "#EF476F", borderColor: "rgba(239, 71, 111, 0.2)" }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          <Link href="/admin/doctors" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px", transition: "transform 0.2s ease, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(0, 180, 216, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)" }}>
                <Users size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", color: "white", marginBottom: "4px" }}>Manage Doctors</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Add, edit, or remove doctors from the locator.</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </Link>

          <Link href="/admin/hospitals" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px", transition: "transform 0.2s ease, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(6, 214, 160, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
                <Hospital size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", color: "white", marginBottom: "4px" }}>Manage Hospitals</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Update hospital records and locations.</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </Link>

          <Link href="/admin/first-aid" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: "32px", display: "flex", alignItems: "center", gap: "20px", transition: "transform 0.2s ease, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--warning)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255, 209, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warning)" }}>
                <BookOpen size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "18px", color: "white", marginBottom: "4px" }}>First Aid Guides</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Manage illnesses and first-aid instructions.</p>
              </div>
              <ChevronRight color="var(--text-muted)" />
            </div>
          </Link>

        </div>

        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", paddingLeft: "8px", borderLeft: "4px solid var(--primary-light)" }}>System Statistics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            
            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", background: "rgba(255, 209, 102, 0.1)", padding: "12px", borderRadius: "50%", marginBottom: "12px", color: "var(--warning)" }}>
                <Activity size={24} />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: "4px" }}>{stats.totalSessions}</div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Total Sessions</p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", background: "rgba(0, 119, 182, 0.1)", padding: "12px", borderRadius: "50%", marginBottom: "12px", color: "var(--primary-light)" }}>
                <FileText size={24} />
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: "4px", minHeight: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}>{stats.topIllness}</div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Top Illness</p>
            </div>

            <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", background: "rgba(239, 71, 111, 0.1)", padding: "12px", borderRadius: "50%", marginBottom: "12px", color: "var(--danger)" }}>
                <Settings size={24} />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: "4px" }}>{stats.emergencyAlerts}</div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Emergency Alerts</p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

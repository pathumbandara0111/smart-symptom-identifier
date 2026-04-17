"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Activity, Clock, ShieldAlert, BookOpen, MapPin, Search } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status]);

  if (loading || status === "loading") {
    return <div className="page-container flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-[var(--primary-light)]" size={48} /></div>;
  }

  const name = session?.user?.name || "User";

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header" style={{ marginBottom: "32px", textAlign: "left" }}>
          <h1 className="page-title" style={{ fontSize: "32px" }}>Welcome back, {name}!</h1>
          <p className="page-subtitle">What would you like to do today?</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          
          {/* Quick Actions */}
          <Link href="/symptom-checker" className="glass-card" style={{ padding: "24px", textDecoration: "none", transition: "transform 0.2s, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
            <div style={{ background: "rgba(0, 180, 216, 0.1)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)", marginBottom: "16px" }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: "18px", color: "white", marginBottom: "8px" }}>Check Symptoms</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Analyze new symptoms using AI precision.</p>
          </Link>

          <Link href="/image-checker" className="glass-card" style={{ padding: "24px", textDecoration: "none", transition: "transform 0.2s, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--secondary)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
            <div style={{ background: "rgba(0, 207, 232, 0.1)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)", marginBottom: "16px" }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: "18px", color: "white", marginBottom: "8px" }}>Image Scanner</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Upload an image for visual symptom analysis.</p>
          </Link>

          <Link href="/history" className="glass-card" style={{ padding: "24px", textDecoration: "none", transition: "transform 0.2s, border 0.2s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--success)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}>
            <div style={{ background: "rgba(6, 214, 160, 0.1)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", marginBottom: "16px" }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: "18px", color: "white", marginBottom: "8px" }}>My History</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>View your past symptom logs and AI advice.</p>
          </Link>

        </div>

        <h2 style={{ fontSize: "20px", marginBottom: "20px", paddingLeft: "8px", borderLeft: "4px solid var(--primary-light)" }}>Medical Resources</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          <Link href="/first-aid" className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(43, 85, 128, 0.4)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--glass-bg)"}>
            <div style={{ background: "rgba(255, 209, 102, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--warning)" }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", color: "white", marginBottom: "4px" }}>First-Aid Hub</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Browse emergency protocols.</p>
            </div>
          </Link>

          <Link href="/doctor-locator" className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(43, 85, 128, 0.4)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--glass-bg)"}>
            <div style={{ background: "rgba(0, 180, 216, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--primary-light)" }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", color: "white", marginBottom: "4px" }}>Find Doctors</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Locate clinics and specialists near you.</p>
            </div>
          </Link>

          <Link href="/emergency" className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 71, 111, 0.15)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--glass-bg)"}>
            <div style={{ background: "rgba(239, 71, 111, 0.1)", padding: "12px", borderRadius: "12px", color: "#EF476F" }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", color: "#EF476F", marginBottom: "4px" }}>Emergency</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Call 1990 immediately.</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

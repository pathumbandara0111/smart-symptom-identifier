"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Activity, Clock, BookOpen, MapPin, Search, Phone, Shield } from "lucide-react";

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
    return (
      <div className="page-container flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-[var(--primary-light)]" size={48} />
      </div>
    );
  }

  const name = session?.user?.name || "Patient";

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header" style={{ textAlign: "left", marginBottom: "32px" }}>
          <h1 className="page-title">Welcome, {name}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>What would you like to do today?</p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          
          <Link href="/symptom-checker" className="glass-card" style={{ padding: "24px", textDecoration: "none", transition: "transform 0.2s, border 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary-light)" }}>DIAGNOSIS</span>
              <Activity size={24} color="var(--primary-light)" />
            </div>
            <h3 style={{ fontSize: "18px", color: "white", marginBottom: "6px" }}>Check Symptoms</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Enter symptoms in plain text for fast AI analysis.</p>
          </Link>

          <Link href="/image-checker" className="glass-card" style={{ padding: "24px", textDecoration: "none", transition: "transform 0.2s, border 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>IMAGE SCAN</span>
              <Search size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: "18px", color: "white", marginBottom: "6px" }}>Upload Photo</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Scan visible rashes, wounds, or skin symptoms.</p>
          </Link>

          <Link href="/history" className="glass-card" style={{ padding: "24px", textDecoration: "none", transition: "transform 0.2s, border 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--mild)" }}>RECORDS</span>
              <Clock size={24} color="var(--mild)" />
            </div>
            <h3 style={{ fontSize: "18px", color: "white", marginBottom: "6px" }}>My History</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>View previous assessments and saved advice.</p>
          </Link>

        </div>

        {/* Resources Section */}
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", paddingLeft: "8px", borderLeft: "4px solid var(--primary-light)" }}>
            Medical Resources
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            
            <Link href="/first-aid" className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(6, 214, 160, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mild)" }}>
                <BookOpen size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", color: "white", marginBottom: "4px" }}>First Aid Instructions</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Explore standard procedures for burns, choking, etc.</p>
              </div>
            </Link>

            <Link href="/doctor-locator" className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255, 209, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--moderate)" }}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", color: "white", marginBottom: "4px" }}>Nearby Doctors & Hospitals</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Locate clinics and specialists on map.</p>
              </div>
            </Link>

            <Link href="/emergency" className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px", textDecoration: "none", border: "1px solid rgba(239, 71, 111, 0.3)", background: "rgba(239, 71, 111, 0.05)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 71, 111, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF476F" }}>
                <Phone size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", color: "#EF476F", marginBottom: "4px" }}>Emergency Hotlines</h4>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Instant call to 1990 Suwa Seriya ambulance.</p>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}

import Link from "next/link";
import { Phone, Shield, Flame, Ambulance } from "lucide-react";

export default function EmergencyPage() {
  return (
    <div className="page-container">
      <div className="content-wrapper" style={{ maxWidth: "700px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px", animation: "criticalPulse 1.5s infinite" }}>🚨</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontFamily: "Outfit", fontWeight: 800, color: "#EF476F", marginBottom: "12px" }}>
            Emergency Services
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-muted)" }}>
            For life-threatening emergencies, call immediately
          </p>
        </div>

        {/* Main Emergency Button */}
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            background: "rgba(239, 71, 111, 0.08)",
            border: "2px solid rgba(239, 71, 111, 0.3)",
            borderRadius: "24px",
            marginBottom: "32px",
          }}
        >
          <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "24px" }}>
            Suwa Seriya — National Ambulance Service
          </p>
          <a href="tel:1990" className="btn-emergency" style={{ fontSize: "22px", padding: "20px 48px", textDecoration: "none", display: "inline-flex" }}>
            📞 Call 1990
          </a>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "16px" }}>
            Available 24/7 — Islandwide — Free of charge
          </p>
        </div>

        {/* Other Numbers */}
        <div className="glass-card" style={{ padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>📞 Emergency Contacts</h3>
          {[
            { name: "Suwa Seriya Ambulance", number: "1990", color: "#EF476F" },
            { name: "Police Emergency", number: "119", color: "#FFD166" },
            { name: "Fire & Rescue", number: "110", color: "#F4A261" },
            { name: "Accident Service (Colombo)", number: "011 269 1111", color: "#06D6A0" },
          ].map((c) => (
            <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--glass-border)" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{c.name}</span>
              <a href={`tel:${c.number.replace(/\s/g, "")}`} style={{ color: c.color, fontWeight: 700, fontSize: "18px", textDecoration: "none", background: `rgba(${c.color === '#EF476F' ? '239, 71, 111' : c.color === '#FFD166' ? '255, 209, 102' : c.color === '#F4A261' ? '244, 162, 97' : '6, 214, 160'}, 0.1)`, padding: "8px 16px", borderRadius: "8px" }}>
                {c.number}
              </a>
            </div>
          ))}
        </div>

        {/* While Waiting */}
        <div className="glass-card" style={{ padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>⚡ While Waiting for Ambulance</h3>
          {[
            "Keep the patient calm and lying down",
            "Do NOT move the patient unless in immediate danger",
            "Ensure clear access for emergency personnel",
            "Have any relevant medications or medical history ready",
            "Perform CPR only if trained and patient is unresponsive",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
              <span style={{ color: "var(--primary-light)", fontSize: "18px", lineHeight: 1 }}>•</span>
              <span style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Doctor Locator Link */}
        <div style={{ textAlign: "center" }}>
          <Link href="/doctor-locator" className="btn-secondary">
            Find Nearest Hospital Instead →
          </Link>
        </div>
      </div>
    </div>
  );
}

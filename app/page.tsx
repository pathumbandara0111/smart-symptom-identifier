import Link from "next/link";
import { Activity, Camera, MapPin, Phone, BookOpen, ArrowRight, Shield } from "lucide-react";

const features = [
  {
    href: "/symptom-checker",
    icon: "🔍",
    iconBg: "rgba(0, 119, 182, 0.2)",
    title: "Check Symptoms",
    desc: "Describe your symptoms in plain language and get AI-powered illness predictions instantly.",
    color: "#00B4D8",
  },
  {
    href: "/image-checker",
    icon: "📷",
    iconBg: "rgba(0, 207, 232, 0.2)",
    title: "Upload Photo",
    desc: "Take or upload a photo of a visible symptom and let our AI identify potential conditions.",
    color: "#00CFE8",
  },
  {
    href: "/first-aid",
    icon: "🩹",
    iconBg: "rgba(6, 214, 160, 0.2)",
    title: "First Aid Guide",
    desc: "Step-by-step first aid instructions for 20+ common medical situations.",
    color: "#06D6A0",
  },
  {
    href: "/doctor-locator",
    icon: "🗺️",
    iconBg: "rgba(255, 209, 102, 0.2)",
    title: "Find Doctors",
    desc: "Locate nearest doctors and hospitals in real-time with contact details and fees.",
    color: "#FFD166",
  },
  {
    href: "/emergency",
    icon: "🚨",
    iconBg: "rgba(239, 71, 111, 0.2)",
    title: "Emergency",
    desc: "One-tap access to emergency services. Critical symptoms auto-redirect here.",
    color: "#EF476F",
  },
];

const stats = [
  { value: "20+", label: "Illnesses Covered" },
  { value: "AI", label: "Gemini 2.5 Flash" },
  { value: "24/7", label: "Available Anytime" },
  { value: "Free", label: "No Cost to Use" },
];

export default function HomePage() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "60px 24px 80px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 119, 182, 0.1)",
            border: "1px solid rgba(0, 180, 216, 0.2)",
            borderRadius: "50px",
            padding: "6px 16px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#06D6A0" }}>●</span>
          Powered by Google Gemini 2.5 Flash AI
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            marginBottom: "20px",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #CAF0F8, #90E0EF, #00B4D8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Smart Symptom
          </span>
          <br />
          <span style={{ color: "var(--text-primary)" }}>Identifier</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "var(--text-muted)",
            lineHeight: 1.7,
            marginBottom: "40px",
            maxWidth: "560px",
            margin: "0 auto 40px",
          }}
        >
          AI-powered health assistant that identifies possible illnesses, provides
          first-aid guidance, and connects you with nearby doctors — instantly.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/symptom-checker" className="btn-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
            <Activity size={18} />
            Check Symptoms Now
            <ArrowRight size={16} />
          </Link>
          <Link href="/emergency" className="btn-emergency" style={{ fontSize: "16px", padding: "14px 32px" }}>
            <Phone size={18} />
            Emergency — Call 1990
          </Link>
        </div>

        {/* Disclaimer */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "var(--text-muted)",
            opacity: 0.7,
          }}
        >
          ⚠️ For informational purposes only. Not a substitute for professional medical advice.
        </p>
      </section>

      {/* Stats Bar */}
      <section
        style={{
          background: "var(--glass-bg)",
          borderTop: "1px solid var(--glass-border)",
          borderBottom: "1px solid var(--glass-border)",
          padding: "24px 0",
          marginBottom: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "60px",
            flexWrap: "wrap",
            padding: "0 24px",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  fontFamily: "Outfit",
                  background: "linear-gradient(135deg, #00B4D8, #90E0EF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="content-wrapper" style={{ marginBottom: "80px" }}>
        <div className="page-header">
          <h2 className="page-title">Everything You Need</h2>
          <p className="page-subtitle">
            A complete health support system in one place
          </p>
        </div>

        <div className="feature-grid">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="glass-card feature-card" style={{ textDecoration: "none" }}>
              <div
                className="feature-icon"
                style={{ background: f.iconBg, fontSize: "28px" }}
              >
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px", color: f.color }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: f.color, fontSize: "13px", fontWeight: 600 }}>
                Open <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="content-wrapper" style={{ textAlign: "center", marginBottom: "60px" }}>
        <div
          className="glass-card"
          style={{
            padding: "60px 40px",
            background: "linear-gradient(135deg, rgba(0, 119, 182, 0.1), rgba(0, 180, 216, 0.05))",
          }}
        >
          <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "16px" }}>
            Create a free account to save your symptom history and get personalized insights.
          </p>
          <Link href="/register" className="btn-primary" style={{ fontSize: "16px", padding: "14px 36px" }}>
            Create Free Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid var(--glass-border)",
          color: "var(--text-muted)",
          fontSize: "13px",
        }}
      >
        <p>
          Smart Symptom Identifier — ITBNM-2211-0139 & ITBNM-2211-0111 | Horizon Campus FIT
        </p>
        <p style={{ marginTop: "8px", opacity: 0.6 }}>
          ⚠️ Not a substitute for professional medical advice. Always consult a qualified doctor.
        </p>
      </footer>
    </div>
  );
}

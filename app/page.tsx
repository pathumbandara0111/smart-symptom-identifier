import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

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

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "60px", paddingTop: "20px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "50px",
              background: "rgba(0, 180, 216, 0.1)",
              border: "1px solid rgba(0, 180, 216, 0.3)",
              color: "var(--primary-light)",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            <Shield size={16} />
            AI-Powered Healthcare Assistant
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.15,
              marginBottom: "20px",
            }}
          >
            Your Health, Understood{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00B4D8, #00CFE8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Instantly.
            </span>
          </h1>

          <p className="page-subtitle" style={{ fontSize: "18px", marginBottom: "36px" }}>
            Identify illnesses from text or photos, access verified first-aid guidance, find nearby doctors,
            and reach emergency help in seconds.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/symptom-checker" className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>
              Check Symptoms Now <ArrowRight size={18} />
            </Link>
            <Link href="/image-checker" className="btn-secondary" style={{ padding: "14px 32px", fontSize: "16px" }}>
              Upload Photo
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "60px",
          }}
        >
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="glass-card"
              style={{
                padding: "28px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: f.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "20px",
                }}
              >
                {f.icon}
              </div>

              <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--text-primary)" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, flex: 1, marginBottom: "16px" }}>
                {f.desc}
              </p>

              <span
                style={{
                  color: f.color,
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Explore <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>

        {/* Emergency Callout Banner */}
        <div
          className="glass-card"
          style={{
            padding: "32px",
            border: "1px solid rgba(239, 71, 111, 0.3)",
            background: "rgba(239, 71, 111, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🚨</span>
              <h3 style={{ fontSize: "20px", color: "#EF476F" }}>Medical Emergency?</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              If you or someone nearby is experiencing life-threatening symptoms, do not hesitate.
            </p>
          </div>
          <Link href="/emergency" className="btn-emergency" style={{ textDecoration: "none" }}>
            Call Emergency (1990)
          </Link>
        </div>
      </div>
    </div>
  );
}

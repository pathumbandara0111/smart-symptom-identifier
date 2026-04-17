"use client";
import { useEffect, useState } from "react";

interface Illness {
  id: string;
  name: string;
  description: string;
  category: string;
  firstAids: { step: number; instruction: string }[];
}

const categoryIcons: Record<string, string> = {
  respiratory: "🫁",
  general: "🌡️",
  injuries: "🩹",
  digestive: "🍽️",
  allergies: "⚠️",
  emergency: "🚨",
};

export default function FirstAidPage() {
  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [selected, setSelected] = useState<Illness | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetch("/api/firstaid")
      .then((r) => r.json())
      .then((d) => {
        setIllnesses(d.illnesses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(illnesses.map((i) => i.category)))];
  const filtered = activeCategory === "all" ? illnesses : illnesses.filter((i) => i.category === activeCategory);

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(6, 214, 160, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🩹</div>
          </div>
          <h1 className="page-title">First Aid Guide</h1>
          <p className="page-subtitle">Doctor-verified step-by-step first aid instructions for common medical situations.</p>
        </div>

        {/* Category Filter */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: "50px",
                border: "1px solid var(--glass-border)",
                background: activeCategory === cat ? "rgba(0, 119, 182, 0.3)" : "transparent",
                color: activeCategory === cat ? "var(--primary-light)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {categoryIcons[cat] || "📋"} {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
            <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>Loading first aid guides...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: selected ? "280px 1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {/* Cards */}
            <div style={selected ? { display: "flex", flexDirection: "column", gap: "12px" } : { display: "contents" }}>
              {filtered.map((illness) => (
                <button
                  key={illness.id}
                  onClick={() => setSelected(selected?.id === illness.id ? null : illness)}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    textAlign: "left",
                    cursor: "pointer",
                    border: selected?.id === illness.id ? "1px solid var(--primary-light)" : "1px solid var(--glass-border)",
                    background: selected?.id === illness.id ? "rgba(0, 180, 216, 0.1)" : "var(--glass-bg)",
                    width: "100%",
                    display: "block",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{categoryIcons[illness.category] || "📋"}</div>
                  <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-primary)" }}>{illness.name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{illness.description}</p>
                  <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--primary-light)", fontWeight: 600 }}>
                    {illness.firstAids.length} steps →
                  </p>
                </button>
              ))}
            </div>

            {/* Detail Panel */}
            {selected && (
              <div className="glass-card" style={{ padding: "32px", alignSelf: "start" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h2 style={{ fontSize: "22px" }}>{selected.name}</h2>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>✕</button>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>{selected.description}</p>

                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                  First Aid Steps
                </h4>

                {selected.firstAids
                  .sort((a, b) => a.step - b.step)
                  .map((fa) => (
                    <div key={fa.step} className="step-item">
                      <div className="step-number">{fa.step}</div>
                      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)" }}>{fa.instruction}</p>
                    </div>
                  ))}

                <div style={{ marginTop: "24px", padding: "14px", background: "rgba(239, 71, 111, 0.05)", border: "1px solid rgba(239, 71, 111, 0.15)", borderRadius: "10px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    ⚠️ This information is for guidance only. Always seek professional medical help for serious conditions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

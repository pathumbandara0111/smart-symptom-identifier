"use client";
import { useEffect, useState } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/firstaid")
      .then((r) => r.json())
      .then((d) => {
        setIllnesses(d.illnesses || []);
        if (d.illnesses && d.illnesses.length > 0) {
          setSelected(d.illnesses[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(illnesses.map((i) => i.category)))];

  const filtered = illnesses.filter((i) => {
    const matchesCat = activeCategory === "all" || i.category === activeCategory;
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "rgba(6, 214, 160, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🩹
            </div>
          </div>
          <h1 className="page-title">First Aid Guide</h1>
          <p className="page-subtitle">
            Doctor-verified step-by-step first aid instructions for common medical situations and injuries.
          </p>
        </div>

        {/* Category Pills & Search */}
        <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ position: "relative", maxWidth: "480px", margin: "0 auto", width: "100%" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search condition or symptom (e.g., Burn, Fever)..."
              className="form-input"
              style={{ paddingLeft: "42px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "50px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: activeCategory === c ? "1px solid var(--primary-light)" : "1px solid var(--glass-border)",
                  background: activeCategory === c ? "rgba(0, 180, 216, 0.2)" : "rgba(5, 21, 37, 0.6)",
                  color: activeCategory === c ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{categoryIcons[c] || "🩹"}</span>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Left Cards List, Right Detail Panel */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: "var(--text-muted)" }}>
            <Loader2 className="animate-spin" size={36} />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.3fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Illnesses List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
              {filtered.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="glass-card"
                    style={{
                      padding: "20px",
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--primary-light)" : "1px solid var(--glass-border)",
                      background: isSelected ? "rgba(0, 180, 216, 0.12)" : "var(--glass-bg)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>{item.name}</h3>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "rgba(0, 180, 216, 0.15)",
                          color: "var(--primary-light)",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                      {item.description}
                    </p>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--secondary)", fontWeight: 500 }}>
                      {item.firstAids.length} Action Steps →
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No first aid guides match your search.
                </div>
              )}
            </div>

            {/* Step Detail Panel */}
            {selected ? (
              <div className="glass-card" style={{ padding: "32px", position: "sticky", top: "90px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "24px" }}>{categoryIcons[selected.category] || "🩹"}</span>
                  <h2 style={{ fontSize: "24px", color: "var(--text-primary)" }}>{selected.name}</h2>
                </div>

                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.6 }}>
                  {selected.description}
                </p>

                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "16px",
                  }}
                >
                  Step-by-Step Instructions
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[...selected.firstAids]
                    .sort((a, b) => a.step - b.step)
                    .map((fa) => (
                      <div key={fa.step} className="step-item">
                        <div className="step-number">{fa.step}</div>
                        <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-primary)", paddingTop: "4px" }}>
                          {fa.instruction}
                        </p>
                      </div>
                    ))}
                </div>

                <div
                  style={{
                    marginTop: "28px",
                    padding: "16px",
                    background: "rgba(239, 71, 111, 0.08)",
                    border: "1px solid rgba(239, 71, 111, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                    ⚠️ This information is for general first-aid guidance only. In serious or worsening situations, contact emergency services or consult a doctor immediately.
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Select a condition from the list to view first aid instructions.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

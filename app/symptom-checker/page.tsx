"use client";
import { useState } from "react";
import { Activity, Send, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { FeedbackForm } from "@/components/FeedbackForm";

interface AnalysisResult {
  possibleIllnesses: string[];
  severity: string;
  firstAidSteps: string[];
  specialistType: string;
  emergencyRequired: boolean;
  additionalInfo: string;
  disclaimer: string;
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const severityConfig = {
    mild: { label: "🟢 Mild", class: "severity-mild", color: "#06D6A0" },
    moderate: { label: "🟡 Moderate", class: "severity-moderate", color: "#FFD166" },
    severe: { label: "🔴 Severe", class: "severity-severe", color: "#F4A261" },
    critical: { label: "🚨 CRITICAL", class: "severity-critical", color: "#EF476F" },
  };

  async function handleAnalyze() {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      toast.error("Please describe your symptoms in more detail.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/symptom/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, age, gender }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.analysis);
      toast.success("Analysis complete!");

      if (data.analysis.emergencyRequired) {
        toast.error("⚠️ CRITICAL symptoms detected! Please call emergency services immediately.", {
          duration: 8000,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const severity = result?.severity as keyof typeof severityConfig;
  const sConfig = severityConfig[severity] || severityConfig.mild;

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
                background: "rgba(0, 119, 182, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🔍
            </div>
          </div>
          <h1 className="page-title">Symptom Checker</h1>
          <p className="page-subtitle">
            Describe your symptoms below and our SmartSymptom AI will analyze possible illnesses
            and provide first-aid guidance.
          </p>
        </div>

        <div className="symptom-result-grid" style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "24px", transition: "all 0.3s" }}>
          {/* Input Form */}
          <div className="glass-card" style={{ padding: "32px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity size={20} color="var(--primary-light)" />
              Describe Your Symptoms
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Your Symptoms *</label>
              <textarea
                className="form-input"
                rows={6}
                placeholder="Example: I have a headache and fever for 2 days. I also feel tired and have a sore throat..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ resize: "vertical", minHeight: "140px" }}
              />
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                {symptoms.length}/500 characters — Be as detailed as possible for better results
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label className="form-label">Age Group</label>
                <select
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Not specified</option>
                  <option value="Child (0-12)">Child (0–12 yrs)</option>
                  <option value="Teen (13-18)">Teen (13–18 yrs)</option>
                  <option value="Adult (19-59)">Adult (19–59 yrs)</option>
                  <option value="Senior (60+)">Senior (60+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select
                  className="form-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "14px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: "spin 0.8s linear infinite" }} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze Symptoms
                </>
              )}
            </button>

            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "16px", textAlign: "center", lineHeight: 1.5 }}>
              ⚠️ This is for informational purposes only and not a substitute for professional medical advice.
            </p>
          </div>

          {/* Results Panel */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Emergency Banner */}
              {result.emergencyRequired && (
                <div className="emergency-banner">
                  <span style={{ fontSize: "32px" }}>🚨</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#EF476F", fontSize: "16px", marginBottom: "4px" }}>
                      EMERGENCY — Call Immediately!
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      Your symptoms indicate a serious condition requiring immediate medical attention.
                    </div>
                  </div>
                  <Link href="/emergency" className="btn-emergency" style={{ padding: "10px 20px", fontSize: "14px" }}>
                    📞 Call 1990
                  </Link>
                </div>
              )}

              {/* Main Result Card */}
              <div className="glass-card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px" }}>Analysis Result</h3>
                  <span className={`severity-badge ${sConfig.class}`}>
                    {sConfig.label}
                  </span>
                </div>

                {/* Possible Illnesses */}
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Possible Conditions
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {result.possibleIllnesses.map((illness, i) => (
                      <span
                        key={i}
                        style={{
                          background: i === 0 ? "rgba(0, 119, 182, 0.2)" : "rgba(0, 180, 216, 0.08)",
                          border: `1px solid ${i === 0 ? "rgba(0, 180, 216, 0.4)" : "rgba(0, 180, 216, 0.15)"}`,
                          color: i === 0 ? "var(--primary-light)" : "var(--text-secondary)",
                          padding: "6px 14px",
                          borderRadius: "50px",
                          fontSize: "14px",
                          fontWeight: i === 0 ? 600 : 400,
                        }}
                      >
                        {i === 0 && "⭐ "}{illness}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialist */}
                <div
                  style={{
                    background: "rgba(255, 209, 102, 0.08)",
                    border: "1px solid rgba(255, 209, 102, 0.2)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <span>👨‍⚕️</span>
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Recommended Specialist</p>
                    <p style={{ fontSize: "14px", color: "#FFD166", fontWeight: 600 }}>{result.specialistType}</p>
                  </div>
                </div>

                {/* Additional Info */}
                {result.additionalInfo && (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
                    ℹ️ {result.additionalInfo}
                  </p>
                )}

                <Link href="/doctor-locator" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  🗺️ Find Nearby Doctors
                </Link>
              </div>

              {/* First Aid Steps */}
              <div className="glass-card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  🩹 First Aid Steps
                </h3>
                {result.firstAidSteps.map((step, i) => (
                  <div key={i} className="step-item">
                    <div className="step-number">{i + 1}</div>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)" }}>{step}</p>
                  </div>
                ))}
                <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {result.disclaimer}
                </p>
              </div>
              <FeedbackForm />
            </div>
          )}
        </div>

        {/* Tips */}
        {!result && !loading && (
          <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
            <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text-secondary)" }}>
              💡 Tips for Better Results
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                "Include when symptoms started",
                "Describe the pain location and intensity",
                "Mention any related symptoms",
                "Include pre-existing conditions if any",
              ].map((tip) => (
                <div key={tip} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <CheckCircle size={14} color="#06D6A0" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

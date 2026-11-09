"use client";
import { useState } from "react";
import { Activity, Send, AlertTriangle, CheckCircle, Loader2, Cpu, Sparkles, MapPin, Phone } from "lucide-react";
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
  source?: "kaggle+gemini" | "kaggle" | "gemini-fallback";
  kaggle?: {
    label: string;
    confidence: number | null;
    lowConfidence: boolean;
  };
  warnings?: string[];
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
    severe: { label: "🟠 Severe", class: "severity-severe", color: "#F4A261" },
    critical: { label: "🚨 CRITICAL", class: "severity-critical", color: "#EF476F" },
  };

  async function handleAnalyze() {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      toast.error("Please describe your symptoms in more detail (at least 5 characters).");
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

        {/* Responsive Grid: Form on Left, Result on Right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: result ? "1fr 1fr" : "1fr",
            gap: "24px",
            alignItems: "start",
            transition: "all 0.3s ease",
          }}
        >
          {/* Input Form Card */}
          <div className="glass-card" style={{ padding: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
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
                >
                  <option value="">Not specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze Symptoms
                </>
              )}
            </button>
          </div>

          {/* Results Card */}
          {result && (
            <div className="glass-card" style={{ padding: "32px" }}>
              {/* Emergency Banner */}
              {result.emergencyRequired && (
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(239, 71, 111, 0.15)",
                    border: "1px solid rgba(239, 71, 111, 0.4)",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <AlertTriangle size={24} color="#EF476F" style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: "#EF476F", fontSize: "14px", fontWeight: 700 }}>
                      EMERGENCY MEDICAL ATTENTION REQUIRED
                    </h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                      Critical symptoms detected. Please call 1990 immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Header: Severity & AI Model Source */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <span className={`severity-badge ${sConfig.class}`}>
                  {sConfig.label}
                </span>

                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "50px",
                    background: "rgba(0, 180, 216, 0.1)",
                    border: "1px solid rgba(0, 180, 216, 0.25)",
                    color: "var(--primary-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {result.source === "gemini-fallback" ? (
                    <>
                      <Sparkles size={13} /> Gemini Backup
                    </>
                  ) : (
                    <>
                      <Cpu size={13} /> Kaggle Model + Gemini
                    </>
                  )}
                </span>
              </div>

              {/* Possible Illnesses */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Possible Condition
                </h3>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {result.possibleIllnesses[0]}
                </div>
                {result.possibleIllnesses.length > 1 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                    {result.possibleIllnesses.slice(1).map((ill, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "12px",
                          background: "rgba(255, 255, 255, 0.05)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {ill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Context */}
              {result.additionalInfo && (
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                  {result.additionalInfo}
                </p>
              )}

              {/* First Aid Steps */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
                  Recommended First Aid Steps
                </h4>
                {result.firstAidSteps.map((step, i) => (
                  <div key={i} className="step-item">
                    <div className="step-number">{i + 1}</div>
                    <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--text-secondary)" }}>
                      {step.replace(/^Step\s*\d+\s*[:.-]\s*/i, "")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recommended Doctor Referral */}
              <div
                style={{
                  padding: "16px",
                  background: "rgba(0, 119, 182, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Recommended Specialist</div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--primary-light)" }}>
                    {result.specialistType}
                  </div>
                </div>
                <Link
                  href={`/doctor-locator?q=${encodeURIComponent(result.specialistType)}`}
                  className="btn-primary"
                  style={{ padding: "8px 18px", fontSize: "13px" }}
                >
                  <MapPin size={14} /> Find Doctors
                </Link>
              </div>

              {/* Medical Disclaimer */}
              <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "20px" }}>
                {result.disclaimer}
              </p>

              {/* Rate Result */}
              <FeedbackForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, X, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

export default function ImageCheckerPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setResult(null);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
  };

  async function handleAnalyze() {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("description", description);

      const res = await fetch("/api/symptom/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data.analysis);
      toast.success("Image analysis complete!");

      if (data.analysis.emergencyRequired) {
        toast.error("⚠️ CRITICAL symptoms detected! Call emergency services immediately!", { duration: 8000 });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const severityConfig: Record<string, { label: string; class: string }> = {
    mild: { label: "🟢 Mild", class: "severity-mild" },
    moderate: { label: "🟡 Moderate", class: "severity-moderate" },
    severe: { label: "🔴 Severe", class: "severity-severe" },
    critical: { label: "🚨 CRITICAL", class: "severity-critical" },
  };
  const sConfig = severityConfig[result?.severity || "mild"] || severityConfig.mild;

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(0, 207, 232, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
              📷
            </div>
          </div>
          <h1 className="page-title">Image Symptom Analyzer</h1>
          <p className="page-subtitle">
            Upload a photo of a visible symptom (rash, wound, swelling, etc.) and our Gemini AI will analyze it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "24px" }}>
          {/* Upload Panel */}
          <div className="glass-card" style={{ padding: "32px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Camera size={20} color="var(--primary-light)" />
              Upload Symptom Image
            </h2>

            {!preview ? (
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? "var(--primary-light)" : "var(--glass-border)"}`,
                  borderRadius: "16px",
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDragActive ? "rgba(0, 180, 216, 0.05)" : "transparent",
                  transition: "all 0.3s ease",
                  marginBottom: "24px",
                }}
              >
                <input {...getInputProps()} />
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📸</div>
                <p style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: "8px" }}>
                  {isDragActive ? "Drop image here..." : "Drag & drop or click to select"}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  Supports JPEG, PNG, WEBP — Max 10MB
                </p>
              </div>
            ) : (
              <div style={{ position: "relative", marginBottom: "24px", borderRadius: "12px", overflow: "hidden" }}>
                <img
                  src={preview}
                  alt="Symptom preview"
                  style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "12px" }}
                />
                <button
                  onClick={removeImage}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(239, 71, 111, 0.8)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  <X size={16} />
                </button>
                <div style={{ padding: "12px", background: "rgba(5, 21, 37, 0.8)" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    📁 {file?.name} — {(file!.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label className="form-label">Additional Description (Optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe what you see and any symptoms: e.g. 'Red rash on arm for 3 days, started itching yesterday'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !file}
              style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "14px" }}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Analyzing Image...</>
              ) : (
                <><Upload size={18} /> Analyze Image</>
              )}
            </button>

            <div style={{ marginTop: "20px", padding: "14px", background: "rgba(255, 209, 102, 0.05)", border: "1px solid rgba(255, 209, 102, 0.2)", borderRadius: "10px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                💡 <strong style={{ color: "#FFD166" }}>Tips:</strong> Use clear, well-lit photos. Avoid blurry images. Do NOT upload images of sensitive or private areas.
              </p>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {result.emergencyRequired && (
                <div className="emergency-banner">
                  <span style={{ fontSize: "32px" }}>🚨</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#EF476F", fontSize: "16px", marginBottom: "4px" }}>EMERGENCY!</div>
                    <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Critical condition detected. Seek help immediately.</div>
                  </div>
                  <Link href="/emergency" className="btn-emergency" style={{ padding: "10px 20px", fontSize: "14px" }}>📞 Call 1990</Link>
                </div>
              )}

              <div className="glass-card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px" }}>Image Analysis Result</h3>
                  <span className={`severity-badge ${sConfig.class}`}>{sConfig.label}</span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase" }}>Possible Conditions</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {result.possibleIllnesses.map((illness, i) => (
                      <span key={i} style={{ background: i === 0 ? "rgba(0, 119, 182, 0.2)" : "rgba(0, 180, 216, 0.08)", border: `1px solid ${i === 0 ? "rgba(0, 180, 216, 0.4)" : "rgba(0, 180, 216, 0.15)"}`, color: i === 0 ? "var(--primary-light)" : "var(--text-secondary)", padding: "6px 14px", borderRadius: "50px", fontSize: "14px", fontWeight: i === 0 ? 600 : 400 }}>
                        {i === 0 && "⭐ "}{illness}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255, 209, 102, 0.08)", border: "1px solid rgba(255, 209, 102, 0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Recommended Specialist</p>
                  <p style={{ fontSize: "14px", color: "#FFD166", fontWeight: 600 }}>👨‍⚕️ {result.specialistType}</p>
                </div>

                {result.additionalInfo && (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>ℹ️ {result.additionalInfo}</p>
                )}

                <Link href="/doctor-locator" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  🗺️ Find Nearby Doctors
                </Link>
              </div>

              <div className="glass-card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>🩹 First Aid Steps</h3>
                {result.firstAidSteps.map((step, i) => (
                  <div key={i} className="step-item">
                    <div className="step-number">{i + 1}</div>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)" }}>{step}</p>
                  </div>
                ))}
                <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>{result.disclaimer}</p>
              </div>
              <FeedbackForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

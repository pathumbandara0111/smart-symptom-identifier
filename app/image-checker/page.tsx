"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, X, Send, Loader2, AlertTriangle, Cpu, Sparkles, MapPin } from "lucide-react";
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

  /**
   * Helper to resize image to 224x224 (required by MobileNetV2)
   * This drastically reduces payload size for Ngrok/Kaggle.
   */
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new (window as any).Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 224;
          canvas.height = 224;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, 224, 224);
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, "image/jpeg", 0.8);
        };
      };
    });
  };

  async function handleAnalyze() {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const resizedBlob = await resizeImage(file);
      const formData = new FormData();
      formData.append("image", resizedBlob, "image.jpg");
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
    severe: { label: "🟠 Severe", class: "severity-severe" },
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
            Upload a photo of a visible symptom (rash, skin lesion, wound, swelling) and our SmartSymptom AI will analyze it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "24px", alignItems: "start" }}>
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
                  border: `2px dashed ${isDragActive ? 'var(--primary-light)' : 'var(--glass-border)'}`,
                  borderRadius: "16px",
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: isDragActive ? "rgba(0, 119, 182, 0.1)" : "rgba(5, 21, 37, 0.5)",
                  marginBottom: "24px",
                }}
              >
                <input {...getInputProps()} />
                <Upload size={40} style={{ color: "var(--primary-light)", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>
                  {isDragActive ? "Drop image here..." : "Drag & drop your photo here"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  Or click to browse from device (JPG, PNG, WebP up to 10MB)
                </p>
              </div>
            ) : (
              <div style={{ position: "relative", marginBottom: "24px", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--glass-border)", maxHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Uploaded symptom" style={{ width: "100%", height: "auto", maxHeight: "300px", objectFit: "contain" }} />
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
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label className="form-label">Additional Description (Optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g., Appeared 3 days ago, itchy, spreads on right arm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze Photo
                </>
              )}
            </button>
          </div>

          {/* Result Panel */}
          {result && (
            <div className="glass-card" style={{ padding: "32px" }}>
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
                      URGENT MEDICAL ATTENTION RECOMMENDED
                    </h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                      Critical indicators detected. Consult a healthcare professional immediately.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
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
                      <Sparkles size={13} /> Gemini Vision Backup
                    </>
                  ) : (
                    <>
                      <Cpu size={13} /> MobileNetV2 + Gemini
                    </>
                  )}
                </span>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Identified Condition
                </h3>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {result.possibleIllnesses[0]}
                </div>
                {result.kaggle?.confidence && (
                  <p style={{ fontSize: "12px", color: "var(--primary-light)", marginTop: "4px" }}>
                    Model Confidence: {(result.kaggle.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              {result.additionalInfo && (
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                  {result.additionalInfo}
                </p>
              )}

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
                  <MapPin size={14} /> Find Specialist
                </Link>
              </div>

              <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "20px" }}>
                {result.disclaimer}
              </p>

              <FeedbackForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

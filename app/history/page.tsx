"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Clock, Trash2, ArrowRight, Activity, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface AIResponse {
  possibleIllnesses: string[];
  severity: string;
}

interface SymptomSession {
  id: string;
  symptomText: string | null;
  imagePath: string | null;
  aiResponse: AIResponse;
  severity: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<SymptomSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchHistory();
    } else if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch history");
      setSessions(data.sessions || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete session");
      
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success("Past session deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const severityConfig: Record<string, { label: string; class: string }> = {
    mild: { label: "🟢 Mild", class: "severity-mild" },
    moderate: { label: "🟡 Moderate", class: "severity-moderate" },
    severe: { label: "🟠 Severe", class: "severity-severe" },
    critical: { label: "🚨 CRITICAL", class: "severity-critical" },
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-[var(--primary-light)]" size={48} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="page-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(0, 119, 182, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
              ⏳
            </div>
          </div>
          <h1 className="page-title">Assessment History</h1>
          <p className="page-subtitle">View and manage your previous AI symptom checks and diagnoses.</p>
        </div>

        {sessions.length === 0 ? (
          <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <Clock size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>No history found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              You haven&apos;t run any symptom assessments yet.
            </p>
            <Link href="/symptom-checker" className="btn-primary">
              Check Symptoms Now
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sessions.map((s) => {
              const sConfig = severityConfig[s.severity || "mild"] || severityConfig.mild;
              let timeFormatted = "Recently";
              try {
                timeFormatted = formatDistanceToNow(new Date(s.createdAt), { addSuffix: true });
              } catch {}

              return (
                <div key={s.id} className="glass-card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <span className={`severity-badge ${sConfig.class}`}>
                        {sConfig.label}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {timeFormatted}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                      {s.aiResponse?.possibleIllnesses?.[0] || "Unknown Condition"}
                    </h3>

                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineClamp: 2 }}>
                      {s.symptomText || "Image based analysis"}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        background: "rgba(239, 71, 111, 0.1)",
                        border: "1px solid rgba(239, 71, 111, 0.2)",
                        borderRadius: "8px",
                        padding: "8px",
                        color: "#EF476F",
                        cursor: "pointer",
                      }}
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

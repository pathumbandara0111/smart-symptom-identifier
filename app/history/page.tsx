"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Clock, Trash2, ArrowRight, Activity, Loader2 } from "lucide-react";
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
      setSessions(data.sessions);
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
    severe: { label: "🔴 Severe", class: "severity-severe" },
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
      <div className="content-wrapper" style={{ maxWidth: "800px" }}>
        <div className="page-header" style={{ marginBottom: "32px", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(0, 180, 216, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)" }}>
              <Clock size={24} />
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: "28px", marginBottom: "4px" }}>Symptom History</h1>
              <p className="page-subtitle" style={{ fontSize: "14px" }}>
                View and manage your past AI symptom analyses.
              </p>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: "64px 24px" }}>
            <Activity size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--text-light)" }}>No History Found</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>You haven't checked any symptoms yet.</p>
            <Link href="/symptom-checker" className="btn-primary" style={{ display: "inline-flex", width: "auto" }}>
              Check Symptoms Now
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sessions.map((item) => {
              const sConfig = severityConfig[item.severity || "mild"] || severityConfig.mild;
              const date = new Date(item.createdAt);
              
              return (
                <div key={item.id} className="glass-card" style={{ padding: "24px", position: "relative", transition: "transform 0.2s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={12} />
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                        <span style={{ opacity: 0.7 }}>({formatDistanceToNow(date)} ago)</span>
                      </div>
                      <div className={`severity-badge ${sConfig.class}`} style={{ transform: "scale(0.85)", transformOrigin: "left center", marginBottom: "0" }}>
                        {sConfig.label}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ 
                        background: "rgba(239, 71, 111, 0.1)", 
                        border: "none", 
                        padding: "8px", 
                        borderRadius: "8px", 
                        color: "#EF476F", 
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 71, 111, 0.2)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 71, 111, 0.1)"}
                      aria-label="Delete History Session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(3, 4, 94, 0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                    <p style={{ fontSize: "14px", color: "var(--text-light)", lineHeight: 1.5 }}>
                      <strong>Symptoms reported:</strong>{" "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {item.symptomText || (item.imagePath ? "[Image Uploaded]" : "No details provided")}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                      AI Predicted Conditions
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {item.aiResponse?.possibleIllnesses?.slice(0, 3).map((illness, i) => (
                        <span key={i} style={{ 
                          background: "rgba(0, 180, 216, 0.08)", 
                          border: "1px solid rgba(0, 180, 216, 0.15)", 
                          color: "var(--text-secondary)", 
                          padding: "4px 10px", 
                          borderRadius: "50px", 
                          fontSize: "12px" 
                        }}>
                          {illness}
                        </span>
                      ))}
                      {item.aiResponse?.possibleIllnesses?.length > 3 && (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
                          +{item.aiResponse.possibleIllnesses.length - 3} more
                        </span>
                      )}
                    </div>
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

"use client";
import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function FeedbackForm() {
  const { status } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a star rating.");
      return;
    }
    
    if (status !== "authenticated") {
      toast.error("You must be logged in to leave feedback.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="glass-card" style={{ padding: "24px", textAlign: "center", marginTop: "16px" }}>
        <div style={{ display: "inline-flex", background: "rgba(6, 214, 160, 0.1)", padding: "12px", borderRadius: "50%", color: "var(--success)", marginBottom: "12px" }}>
          <Star size={24} fill="currentColor" />
        </div>
        <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Feedback Received</h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Thank you! Your input helps us improve our AI accuracy.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: "24px", marginTop: "16px" }}>
      <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>How helpful was this result?</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                transition: "transform 0.1s ease"
              }}
            >
              <Star 
                size={28} 
                color={star <= (hover || rating) ? "#FFD166" : "var(--glass-border)"} 
                fill={star <= (hover || rating) ? "#FFD166" : "transparent"} 
              />
            </button>
          ))}
        </div>
        <textarea
          className="form-input"
          placeholder="Any additional comments? (Optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          style={{ marginBottom: "16px", resize: "none", fontSize: "13px" }}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "10px", justifyContent: "center" }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Submit Feedback</>}
        </button>
      </form>
      {status === "unauthenticated" && (
        <p style={{ fontSize: "11px", color: "var(--danger)", marginTop: "12px", textAlign: "center" }}>
          Note: You must be logged in to test the feedback feature.
        </p>
      )}
    </div>
  );
}

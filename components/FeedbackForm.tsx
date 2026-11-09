"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button, buttonClass } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Form";

/** Rating popup shown from the analysis result ("Rate this result"). */
export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { status } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return toast.error("Please choose a star rating.");
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
      setDone(true);
      toast.success("Thank you for your feedback!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    onClose();
    setTimeout(() => {
      setDone(false);
      setRating(0);
      setComment("");
    }, 200);
  }

  return (
    <Modal open={open} onClose={close} title="How was this result?" size="sm">
      {status !== "authenticated" ? (
        <div className="text-center">
          <p className="text-sm text-muted">Sign in to send feedback. It helps us improve the AI.</p>
          <Link href="/login" className={buttonClass("primary", "md", "mt-4")}>
            Sign in
          </Link>
        </div>
      ) : done ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(52,211,153,.14)] text-mild">
            <Star fill="currentColor" size={22} />
          </div>
          <p className="font-semibold">Feedback received</p>
          <Button variant="secondary" className="mt-4" onClick={close}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex justify-center gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="rounded-lg p-1.5 transition-transform hover:scale-110"
              >
                <Star size={32} className={(hover || rating) >= n ? "text-moderate" : "text-line-strong"} fill={(hover || rating) >= n ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <Textarea label="Comments (optional)" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Was it helpful or accurate?" />
          <Button type="submit" loading={loading} className="w-full">
            Send feedback
          </Button>
        </form>
      )}
    </Modal>
  );
}

// Backwards-compatible inline export
export function FeedbackForm() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Star size={16} /> Rate this result
      </Button>
      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

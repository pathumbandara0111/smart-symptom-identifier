"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Stethoscope, MapPin, Info, Star, Phone, Cpu, Sparkles, RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button, buttonClass } from "@/components/ui/Button";
import { SeverityBadge, SEVERITY, Badge } from "@/components/ui/Feedback";
import { FeedbackModal } from "@/components/FeedbackForm";

export interface AnalysisResult {
  possibleIllnesses: string[];
  severity: string;
  firstAidSteps: string[];
  specialistType: string;
  emergencyRequired: boolean;
  additionalInfo: string;
  disclaimer: string;
  source?: "kaggle+gemini" | "kaggle" | "gemini-fallback" | "kaggle" | "gemini";
  kaggle?: { label: string; confidence: number | null; lowConfidence: boolean; topK?: { label: string; confidence: number }[] };
  warnings?: string[];
}

const SOURCE_LABEL: Record<string, { text: string; tone: "brand" | "info" | "warn"; icon: React.ReactNode }> = {
  "kaggle+gemini": { text: "Custom AI model + Gemini details", tone: "brand", icon: <Cpu size={13} /> },
  kaggle: { text: "Custom AI model", tone: "brand", icon: <Cpu size={13} /> },
  "gemini-fallback": { text: "Gemini AI (backup mode)", tone: "warn", icon: <Sparkles size={13} /> },
  gemini: { text: "Gemini AI", tone: "info", icon: <Sparkles size={13} /> },
};

export function AnalysisResultView({ result, onReset }: { result: AnalysisResult; onReset?: () => void }) {
  const [alertOpen, setAlertOpen] = useState(result.emergencyRequired);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const sev = SEVERITY[result.severity] ?? SEVERITY.mild;
  const conf = result.kaggle?.confidence ?? null;
  const src = result.source ? SOURCE_LABEL[result.source] : undefined;
  const critical = result.emergencyRequired || result.severity === "critical";

  return (
    <div className="space-y-5">
      {critical && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[rgba(244,63,94,.5)] bg-[rgba(244,63,94,.1)] p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-critical" size={22} />
          <div className="flex-1">
            <p className="font-bold text-[#fda4af]">Possible emergency</p>
            <p className="mt-1 text-sm text-muted">Do not wait. Call emergency services now or go to the nearest hospital.</p>
            <a href="tel:1990" className={buttonClass("danger", "sm", "mt-3")}>
              <Phone size={15} /> Call 1990
            </a>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={result.severity} />
          {src && (
            <Badge tone={src.tone}>
              {src.icon} {src.text}
            </Badge>
          )}
          {result.kaggle?.lowConfidence && <Badge tone="warn">Low confidence</Badge>}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-faint">Most likely condition</p>
        <h2 className="mt-1 text-2xl font-extrabold">{result.possibleIllnesses[0]}</h2>
        <p className="mt-1 text-sm text-muted">{sev.hint}</p>

        {conf !== null && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span>Model confidence</span>
              <span className="font-semibold text-ink">{Math.round(conf * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={Math.round(conf * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full" style={{ width: `${Math.round(conf * 100)}%`, background: conf < 0.6 ? "var(--moderate)" : "var(--brand)" }} />
            </div>
          </div>
        )}

        {result.possibleIllnesses.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Other possibilities</p>
            <div className="flex flex-wrap gap-2">
              {result.possibleIllnesses.slice(1).map((i) => (
                <Badge key={i}>{i}</Badge>
              ))}
            </div>
          </div>
        )}

        {result.kaggle?.topK && result.kaggle.topK.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Model alternatives</p>
            <ul className="space-y-1 text-sm text-muted">
              {result.kaggle.topK.slice(1, 3).map((t) => (
                <li key={t.label} className="flex justify-between">
                  <span>{t.label}</span>
                  <span>{Math.round(t.confidence * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {result.warnings && result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-[rgba(251,191,36,.35)] bg-[rgba(251,191,36,.08)] p-3.5 text-sm text-[#fde68a]">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>{w}</p>
            </div>
          ))}
        </div>
      )}

      {result.additionalInfo && (
        <div className="card p-6">
          <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
            <Info size={17} className="text-info" /> About this condition
          </h3>
          <p className="text-sm leading-relaxed text-muted">{result.additionalInfo}</p>
        </div>
      )}

      <div className="card p-6">
        <h3 className="mb-5 text-base font-bold">First-aid steps</h3>
        <ol className="timeline">
          {result.firstAidSteps.map((step, i) => (
            <li key={i} className="timeline-item">
              <span className="timeline-dot">{i + 1}</span>
              <p className="pt-1 text-sm leading-relaxed text-muted">{step.replace(/^Step\s*\d+\s*[:.-]\s*/i, "")}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(129,140,248,.14)] text-accent">
            <Stethoscope size={22} />
          </div>
          <div>
            <p className="text-xs text-faint">Recommended specialist</p>
            <p className="font-bold">{result.specialistType}</p>
          </div>
        </div>
        <Link href={`/doctor-locator?q=${encodeURIComponent(result.specialistType)}`} className={buttonClass("primary")}>
          <MapPin size={16} /> Find a doctor
        </Link>
      </div>

      <p className="rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-faint">{result.disclaimer}</p>

      <div className="no-print flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setFeedbackOpen(true)}>
          <Star size={16} /> Rate this result
        </Button>
        {onReset && (
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw size={16} /> Start over
          </Button>
        )}
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Emergency alert popup */}
      <Modal open={alertOpen} onClose={() => setAlertOpen(false)} size="sm" hideClose title={undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAlertOpen(false)}>I understand</Button>
            <a href="tel:1990" className={buttonClass("danger")}><Phone size={16} /> Call 1990</a>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="pulse-ring mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(244,63,94,.18)] text-critical">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-[#fda4af]">Emergency symptoms detected</h2>
          <p className="mt-2 text-sm text-muted">Your symptoms may be life-threatening. Please call emergency services or go to the nearest hospital immediately.</p>
        </div>
      </Modal>
    </div>
  );
}

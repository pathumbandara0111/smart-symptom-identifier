"use client";
import { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";

export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-brand ${className}`} aria-label="Loading" />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted" role="status">
      <Spinner size={30} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-faint">{icon ?? <Inbox size={26} />}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  );
}

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
  center,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${center ? "flex-col items-center text-center" : ""}`}>
      <div className={center ? "flex flex-col items-center" : ""}>
        {icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(45,212,191,.12)] text-brand">{icon}</div>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className={`mt-2 max-w-2xl text-base text-muted ${center ? "mx-auto" : ""}`}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export const SEVERITY: Record<string, { label: string; cls: string; hint: string }> = {
  mild: { label: "Mild", cls: "sev-mild", hint: "Can usually be managed at home" },
  moderate: { label: "Moderate", cls: "sev-moderate", hint: "See a doctor within 1–2 days" },
  severe: { label: "Severe", cls: "sev-severe", hint: "Urgent care needed today" },
  critical: { label: "Critical", cls: "sev-critical", hint: "Emergency — call for help now" },
};

export function SeverityBadge({ severity, size = "md" }: { severity: string; size?: "sm" | "md" }) {
  const s = SEVERITY[severity] ?? SEVERITY.mild;
  return (
    <span className={`badge ${s.cls} ${size === "md" ? "!px-3 !py-1.5 !text-[13px]" : ""}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "brand" | "info" | "warn" | "danger" }) {
  const t = tone === "default" ? "" : `badge-${tone}`;
  return <span className={`badge ${t}`}>{children}</span>;
}

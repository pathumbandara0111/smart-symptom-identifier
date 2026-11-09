"use client";
import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** "drawer" slides in from the right (bottom sheet on mobile) */
  variant?: "modal" | "drawer";
  /** prevent closing by backdrop / Esc (e.g. emergency alert) */
  persistent?: boolean;
  hideClose?: boolean;
}

const widths = { sm: "420px", md: "560px", lg: "720px", xl: "960px" };

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** Accessible modal: focus trap, Esc to close, scroll lock, portal. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  variant = "modal",
  persistent,
  hideClose,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const first = ref.current?.querySelector<HTMLElement>("[data-autofocus]") ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 20);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !persistent) {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && ref.current) {
        const els = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open, persistent, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="overlay align-sheet"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !persistent) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        className={`modal ${variant === "drawer" ? "drawer" : ""}`}
        style={{ maxWidth: widths[size] }}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div className="min-w-0">
              {title && <h2 className="text-lg font-bold">{title}</h2>}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {!hideClose && (
              <button onClick={onClose} aria-label="Close dialog" className="btn btn-ghost btn-icon -mr-2 shrink-0">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  tone?: "danger" | "primary";
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", loading, tone = "danger" }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      hideClose
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading} data-autofocus>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(244,63,94,.14)] text-critical">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <div className="mt-1 text-sm text-muted">{message}</div>
        </div>
      </div>
    </Modal>
  );
}

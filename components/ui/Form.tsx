"use client";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef, useId } from "react";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  return (
    <div>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      {children(id)}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-[#fda4af]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

type WithField<T> = T & { label?: string; hint?: string; error?: string };

export const Input = forwardRef<HTMLInputElement, WithField<InputHTMLAttributes<HTMLInputElement>>>(function Input(
  { label, hint, error, className = "", ...rest },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => <input id={id} ref={ref} aria-invalid={!!error} className={`input ${className}`} {...rest} />}
    </Field>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, WithField<TextareaHTMLAttributes<HTMLTextAreaElement>>>(
  function Textarea({ label, hint, error, className = "", ...rest }, ref) {
    return (
      <Field label={label} hint={hint} error={error}>
        {(id) => <textarea id={id} ref={ref} aria-invalid={!!error} className={`input ${className}`} {...rest} />}
      </Field>
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, WithField<SelectHTMLAttributes<HTMLSelectElement>>>(function Select(
  { label, hint, error, className = "", children, ...rest },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => (
        <select id={id} ref={ref} aria-invalid={!!error} className={`input ${className}`} {...rest}>
          {children}
        </select>
      )}
    </Field>
  );
});

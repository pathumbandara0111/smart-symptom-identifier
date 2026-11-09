"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass, type Variant, type Size } from "./button-styles";

export { buttonClass, type Variant, type Size };

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, icon, className = "", children, disabled, type = "button", ...rest },
  ref
) {
  const cls = [
    buttonClass(variant, size),
    icon ? "btn-icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

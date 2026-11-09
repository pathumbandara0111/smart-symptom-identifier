export type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft";
export type Size = "sm" | "md" | "lg";

/**
 * Pure class string helper safe for both Server and Client Components.
 */
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return [
    "btn",
    `btn-${variant}`,
    size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

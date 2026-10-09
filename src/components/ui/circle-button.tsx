import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Round icon button used in previews and the details modal. */
export function CircleButton({
  label,
  variant = "outline",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Accessible name (also shown as a tooltip). */
  label: string;
  variant?: "solid" | "outline";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        variant === "solid"
          ? "bg-ink text-canvas hover:bg-ink/80"
          : "border-2 border-white/50 bg-black/40 text-ink hover:border-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

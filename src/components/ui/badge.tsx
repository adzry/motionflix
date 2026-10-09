import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "flare" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-white/10 text-ink",
  flare: "bg-flare text-white",
  outline: "border border-white/30 text-muted",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

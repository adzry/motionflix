import { cn } from "@/lib/cn";

/** MotionFlix wordmark in the brand red. `compact` renders just the "M". */
export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "font-display leading-none tracking-wide text-flare drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {compact ? "M" : "MotionFlix"}
    </span>
  );
}

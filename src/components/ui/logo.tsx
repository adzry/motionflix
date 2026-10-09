import { cn } from "@/lib/cn";

/** Original MotionFlix wordmark: a play-shaped "M" mark plus text. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-black tracking-tight",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" className="fill-flare" />
        <path
          d="M8 23V9l8 7 8-7v14"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl uppercase">
        Motion<span className="text-flare">Flix</span>
      </span>
    </span>
  );
}

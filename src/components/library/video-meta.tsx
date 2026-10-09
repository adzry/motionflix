import { cn } from "@/lib/cn";
import { formatRuntime } from "@/lib/format";
import type { Video } from "@/types/video";

/** "New · 2026 · 6m 12s · 4K" metadata line. */
export function VideoMeta({
  video,
  isNew,
  className,
}: {
  video: Video;
  isNew?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", className)}>
      {isNew && <span className="font-semibold text-[#46d369]">New</span>}
      <span className="text-muted">{video.year}</span>
      <span className="text-muted">{formatRuntime(video.durationSeconds)}</span>
      <span className="rounded-[3px] border border-white/40 px-1 text-[10px] leading-4 font-semibold text-muted">
        {video.quality}
      </span>
    </p>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label="Watched (sample)"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-[3px] w-full bg-[#808080]/60", className)}
    >
      <div className="h-full bg-flare" style={{ width: `${pct}%` }} />
    </div>
  );
}

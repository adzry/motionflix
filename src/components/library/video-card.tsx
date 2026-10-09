import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import type { Video } from "@/types/video";
import { PosterArt } from "./poster-art";

/**
 * A single 16:9 tile in a video row.
 *
 * Intentionally not a link yet: there is no detail page or player until
 * Phase 4, so the card is a non-interactive article rather than a link that
 * leads nowhere.
 */
export function VideoCard({
  video,
  className,
}: {
  video: Video;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group/card relative shrink-0 snap-start",
        "w-[70%] sm:w-[42%] md:w-[30%] lg:w-[23%] xl:w-[18.5%]",
        className,
      )}
    >
      <PosterArt
        art={video.art}
        className="relative aspect-video rounded-md ring-1 ring-white/5 transition duration-300 ease-out group-hover/card:shadow-card motion-safe:group-hover/card:scale-[1.04]"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-ink sm:text-base">
            {video.title}
          </h3>
          <span className="shrink-0 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-ink tabular-nums">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>
        {video.isPlaceholder && (
          <Badge tone="outline" className="absolute top-2 left-2 bg-black/40">
            Sample
          </Badge>
        )}
      </PosterArt>
      <p className="mt-2 line-clamp-1 text-xs text-subtle">
        {video.tags.join(" · ")}
      </p>
    </article>
  );
}

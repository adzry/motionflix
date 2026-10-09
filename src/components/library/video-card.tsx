"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import type { Video } from "@/types/video";
import { Artwork } from "./artwork";
import { useLibraryUI } from "./library-provider";
import { TitleTreatment } from "./title-treatment";
import { ProgressBar } from "./video-meta";

/** Card widths per breakpoint, tuned to show ~2 / 3 / 4 / 5 / 6 per row. */
export const rowCardWidth =
  "w-[44%] sm:w-[31%] md:w-[23.6%] lg:w-[18.9%] xl:w-[15.8%]";

/**
 * A 16:9 title tile. Hovering with a mouse opens the pop-over preview;
 * clicking or tapping opens the details modal.
 */
export function VideoCard({
  video,
  progress,
  className,
  sizes = "(min-width: 1280px) 16vw, (min-width: 1024px) 19vw, (min-width: 768px) 24vw, (min-width: 640px) 31vw, 44vw",
}: {
  video: Video;
  progress?: number;
  className?: string;
  sizes?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { openDetails, schedulePreview, leaveCard } = useLibraryUI();

  return (
    <div className={cn("shrink-0", className)}>
      <button
        ref={ref}
        type="button"
        onClick={() => openDetails(video)}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse" && ref.current) schedulePreview(video, ref.current, progress);
        }}
        onPointerLeave={leaveCard}
        aria-label={`${video.title}, more info`}
        className={cn(
          "group/card relative block aspect-video w-full overflow-hidden rounded-[4px] bg-surface",
          "transition-[transform,box-shadow] duration-300 ease-cinema",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          "hover:shadow-card motion-safe:active:scale-[0.98]",
        )}
      >
        <Artwork video={video} sizes={sizes} className="transition-transform duration-500 ease-cinema group-hover/card:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Brand mark, like the corner logo on streaming originals. */}
        <span aria-hidden="true" className="absolute top-1.5 left-2 font-display text-lg leading-none text-flare drop-shadow">
          M
        </span>
        <TitleTreatment
          title={video.title}
          style={video.titleStyle}
          className="absolute right-2.5 bottom-2 left-2.5 line-clamp-2 text-left text-base sm:right-3 sm:bottom-2.5 sm:left-3 sm:text-xl"
        />
        {progress !== undefined && (
          <span className="absolute inset-x-2 bottom-1.5">
            <ProgressBar value={progress} />
          </span>
        )}
      </button>
    </div>
  );
}

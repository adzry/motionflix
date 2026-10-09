"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Video } from "@/types/video";
import { VideoCard } from "./video-card";

/**
 * Horizontally scrolling row of video cards.
 *
 * Native overflow scrolling (touch, trackpad, shift+wheel, keyboard when
 * focused) with scroll-snap; arrow buttons page by one viewport width on
 * pointer devices.
 */
export function VideoRow({
  id,
  title,
  videos,
}: {
  id: string;
  title: string;
  videos: Video[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const headingId = `${id}-heading`;

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const page = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (videos.length === 0) return null;

  const arrow =
    "absolute inset-y-0 z-10 hidden w-10 items-center justify-center bg-canvas/70 text-ink opacity-0 transition-opacity " +
    "group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ink md:flex lg:w-12";

  return (
    <section id={id} aria-labelledby={headingId} className="group/row relative">
      <h2
        id={headingId}
        className="mb-3 px-4 text-lg font-bold text-ink sm:px-8 sm:text-xl lg:px-12"
      >
        {title}
      </h2>

      <div className="relative">
        {canPrev && (
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            className={cn(arrow, "left-0 rounded-r-md")}
            onClick={() => page(-1)}
          >
            <ChevronLeftIcon className="size-7" />
          </button>
        )}

        <div
          ref={scrollerRef}
          tabIndex={0}
          aria-label={`${title} videos`}
          role="region"
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pt-2 pb-6 focus-visible:outline-none sm:scroll-px-8 sm:gap-3 sm:px-8 lg:scroll-px-12 lg:px-12"
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {canNext && (
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            className={cn(arrow, "right-0 rounded-l-md")}
            onClick={() => page(1)}
          >
            <ChevronRightIcon className="size-7" />
          </button>
        )}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { LibraryRow } from "@/lib/library";
import { rowCardWidth, VideoCard } from "./video-card";

/**
 * Horizontally scrolling row ("slider") of video cards.
 *
 * Native overflow scrolling (touch, trackpad, keyboard) with scroll-snap,
 * plus Netflix-style paging arrows and page indicators on pointer devices.
 */
export function VideoRow({ row }: { row: LibraryRow }) {
  const { id, title, videos, href, progress } = row;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ canPrev: false, canNext: false, page: 0, pages: 1 });
  const headingId = `${id}-heading`;

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05));
    const page = Math.min(pages - 1, Math.round(el.scrollLeft / el.clientWidth));
    setState({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      page,
      pages,
    });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const page = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Page by the visible width minus the gutters so the next card lands flush.
    const gutter = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollBy({ left: direction * (el.clientWidth - gutter * 2), behavior: "smooth" });
  };

  if (videos.length === 0) return null;

  const arrow =
    "absolute inset-y-0 z-10 hidden w-(--spacing-gutter) items-center justify-center bg-black/50 text-ink " +
    "opacity-0 transition-[opacity,background-color] duration-200 hover:bg-black/70 " +
    "group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink md:flex";

  return (
    <section id={id} aria-labelledby={headingId} className="group/row relative">
      <div className="mb-2 flex items-end justify-between px-gutter">
        <h2 id={headingId} className="flex items-baseline gap-3 text-base font-bold text-[#e5e5e5] sm:text-lg lg:text-xl">
          {href ? (
            <Link href={href} className="group/title inline-flex items-baseline gap-2 hover:text-ink">
              {title}
              <span className="hidden items-center text-xs font-semibold text-[#54b9c5] opacity-0 transition-[opacity,transform] duration-300 group-hover/row:translate-x-1 group-hover/row:opacity-100 md:inline-flex">
                Explore All
                <ChevronRightIcon className="size-3.5" />
              </span>
            </Link>
          ) : (
            title
          )}
        </h2>
        {state.pages > 1 && (
          <div aria-hidden="true" className="hidden gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 md:flex">
            {Array.from({ length: state.pages }, (_, i) => (
              <span key={i} className={cn("h-0.5 w-3", i === state.page ? "bg-[#aaa]" : "bg-[#4d4d4d]")} />
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        {state.canPrev && (
          <button type="button" aria-label={`Previous ${title}`} className={cn(arrow, "left-0 rounded-r")} onClick={() => page(-1)}>
            <ChevronLeftIcon className="size-8 transition-transform hover:scale-125" />
          </button>
        )}

        <div
          ref={scrollerRef}
          role="region"
          aria-label={title}
          tabIndex={-1}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-(--spacing-gutter) gap-1.5 overflow-x-auto overscroll-x-contain px-gutter py-1 sm:gap-2"
        >
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              progress={progress?.[video.id]}
              className={cn(rowCardWidth, "snap-start")}
            />
          ))}
        </div>

        {state.canNext && (
          <button type="button" aria-label={`Next ${title}`} className={cn(arrow, "right-0 rounded-l")} onClick={() => page(1)}>
            <ChevronRightIcon className="size-8 transition-transform hover:scale-125" />
          </button>
        )}
      </div>
    </section>
  );
}

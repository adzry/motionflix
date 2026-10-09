"use client";

import { Button } from "@/components/ui/button";
import { InfoIcon, PlayIcon, PlusIcon } from "@/components/ui/icons";
import { getCategoryConfig } from "@/config/categories";
import { unavailable } from "@/lib/feature-status";
import type { Video } from "@/types/video";
import { Artwork } from "./artwork";
import { useLibraryUI } from "./library-provider";
import { TitleTreatment } from "./title-treatment";

/**
 * Billboard for the featured title: full-bleed backdrop on desktop, a
 * poster card on mobile (mirroring the streaming apps' mobile layout).
 */
export function FeaturedHero({ video, eyebrow }: { video: Video; eyebrow?: string }) {
  const { openDetails, notify } = useLibraryUI();
  const category = getCategoryConfig(video.category);
  const play = () => notify(unavailable.playback);

  return (
    <section aria-labelledby="featured-title" className="relative">
      {/* ---------- Desktop / tablet billboard ---------- */}
      <div className="relative hidden h-[56.25vw] max-h-[92vh] min-h-[520px] w-full overflow-hidden md:block">
        <Artwork video={video} sizes="100vw" priority focus="50% 40%" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />

        <div className="absolute inset-y-0 left-0 flex w-[46%] flex-col justify-center pt-16 pl-gutter">
          {eyebrow && (
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.3em] text-muted uppercase">
              <span className="font-display text-2xl tracking-normal text-flare">M</span>
              {eyebrow}
            </p>
          )}
          <TitleTreatment
            as="h1"
            id="featured-title"
            title={video.title}
            style={video.titleStyle}
            className={
              video.title.length > 14
                ? "text-[clamp(2.5rem,4.6vw,5rem)]"
                : "text-[clamp(3rem,7vw,7.5rem)]"
            }
          />
          <p className="mt-5 line-clamp-3 max-w-xl text-[clamp(0.95rem,1.25vw,1.35rem)] leading-snug text-ink text-shadow-title">
            {video.synopsis}
          </p>
          <div className="mt-6 flex gap-3">
            <Button size="lg" onClick={play}>
              <PlayIcon className="size-7" />
              Play
            </Button>
            <Button size="lg" variant="secondary" onClick={() => openDetails(video)}>
              <InfoIcon className="size-7" />
              More Info
            </Button>
          </div>
        </div>

        {/* Right-edge label, where streaming apps show the maturity rating. */}
        <div className="absolute right-0 bottom-[30%] flex items-center border-l-[3px] border-[#dcdcdc] bg-[#333]/60 py-1.5 pr-gutter pl-3 text-base text-ink">
          {category.title}
        </div>
      </div>

      {/* ---------- Mobile poster card ---------- */}
      <div className="relative px-5 pt-32 pb-6 md:hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <Artwork video={video} sizes="100vw" className="scale-125 opacity-40 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/40 to-canvas" />
        </div>
        <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-lg shadow-pop ring-1 ring-white/10">
          <Artwork video={video} sizes="(max-width: 640px) 90vw, 24rem" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4 text-center">
            <TitleTreatment as="h1" title={video.title} style={video.titleStyle} className="text-5xl" />
            <p className="flex flex-wrap justify-center gap-x-1.5 text-sm text-ink">
              {video.tags.map((tag, i) => (
                <span key={tag} className="inline-flex gap-1.5">
                  {i > 0 && <span aria-hidden="true">•</span>}
                  {tag}
                </span>
              ))}
            </p>
            <div className="grid w-full grid-cols-2 gap-3">
              <Button onClick={play}>
                <PlayIcon className="size-5" />
                Play
              </Button>
              <Button variant="secondary" onClick={() => notify(unavailable.myList)}>
                <PlusIcon className="size-5" />
                My List
              </Button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openDetails(video)}
          className="mx-auto mt-3 flex items-center gap-1.5 text-sm text-muted"
        >
          <InfoIcon className="size-4" /> More info
        </button>
      </div>
    </section>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon, PlayIcon } from "@/components/ui/icons";
import { formatRuntime } from "@/lib/format";
import type { Video } from "@/types/video";
import { PosterArt } from "./poster-art";

const PLAYBACK_NOTE = "Playback arrives in Phase 4 (signed R2 URLs + player).";

/** Full-bleed featured title at the top of the home page. */
export function FeaturedHero({ video }: { video: Video }) {
  const added = new Date(video.createdAt).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section
      aria-labelledby="featured-title"
      className="relative isolate flex min-h-[70svh] items-end overflow-hidden sm:min-h-[78svh] lg:min-h-[85svh]"
    >
      <PosterArt art={video.art} className="absolute inset-0 -z-10" />
      {/* Legibility scrims: left fade for text, bottom fade into the rows. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas/90 via-canvas/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-canvas to-transparent" />

      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-28 pb-16 sm:px-8 sm:pb-24 lg:px-12 lg:pb-32">
        <div className="max-w-xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone="flare">Featured</Badge>
            {video.isPlaceholder && <Badge tone="outline">Sample title</Badge>}
          </div>

          <h1
            id="featured-title"
            className="text-4xl font-black tracking-tight text-balance text-ink sm:text-6xl lg:text-7xl"
          >
            {video.title}
          </h1>

          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{formatRuntime(video.durationSeconds)}</span>
            <span aria-hidden="true">•</span>
            <span>Added {added}</span>
            <span aria-hidden="true">•</span>
            <span>{video.tags.join(", ")}</span>
          </p>

          <p className="mt-4 max-w-prose text-base text-pretty text-ink/90 sm:text-lg">
            {video.synopsis}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" disabled title={PLAYBACK_NOTE}>
              <PlayIcon className="size-5" />
              Play
            </Button>
            <Button size="lg" variant="secondary" disabled title="Title details arrive in Phase 3.">
              <InfoIcon className="size-5" />
              More info
            </Button>
          </div>
          <p className="mt-3 text-xs text-subtle">{PLAYBACK_NOTE}</p>
        </div>
      </div>
    </section>
  );
}

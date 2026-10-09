"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CircleButton } from "@/components/ui/circle-button";
import { ChevronDownIcon, PlayIcon, PlusIcon } from "@/components/ui/icons";
import { unavailable } from "@/lib/feature-status";
import type { Video } from "@/types/video";
import { Artwork } from "./artwork";
import { useLibraryUI } from "./library-provider";
import { TitleTreatment } from "./title-treatment";
import { ProgressBar, VideoMeta } from "./video-meta";

export interface PreviewState {
  video: Video;
  /** Viewport rect of the card being previewed. */
  rect: DOMRect;
  progress?: number;
}

const SCALE = 1.5;
const EDGE = 12;
/** Approximate height of the info panel below the image. */
const PANEL_HEIGHT = 150;

/**
 * Netflix-style "mini modal": an enlarged card that pops over the hovered
 * tile with quick actions and metadata. Rendered in a portal so row
 * overflow never clips it.
 */
export function HoverPreview({
  state,
  onPointerEnter,
  onPointerLeave,
}: {
  state: PreviewState;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const { video, rect, progress } = state;
  const { openDetails, notify, isNew } = useLibraryUI();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const width = rect.width * SCALE;
  const imageHeight = (width * 9) / 16;
  const centeredLeft = rect.left + rect.width / 2 - width / 2;
  const maxLeft = window.innerWidth - width - EDGE;
  // Cards at the row edges grow inward from their outer edge, like Netflix.
  const alignStart = centeredLeft < EDGE;
  const alignEnd = !alignStart && centeredLeft > maxLeft;
  const left = alignStart
    ? Math.max(EDGE, rect.left)
    : alignEnd
      ? Math.min(maxLeft, rect.right - width)
      : centeredLeft;
  // Keep the whole preview (image + panel) inside the viewport.
  const maxTop = window.innerHeight - imageHeight - PANEL_HEIGHT - EDGE;
  const top = Math.max(EDGE, Math.min(rect.top + rect.height / 2 - imageHeight / 2, maxTop));
  const originX = alignStart ? "left" : alignEnd ? "right" : "center";

  const style: CSSProperties = {
    left,
    top,
    width,
    transformOrigin: `${originX} ${rect.top + rect.height / 2 - top}px`,
    transform: entered ? "scale(1)" : `scale(${1 / SCALE})`,
    opacity: entered ? 1 : 0,
  };

  return createPortal(
    <div
      role="dialog"
      aria-label={`${video.title} preview`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={style}
      className="fixed z-[70] overflow-hidden rounded-md bg-surface shadow-pop transition-[transform,opacity] duration-300 ease-cinema"
    >
      <button
        type="button"
        onClick={() => openDetails(video)}
        aria-label={`More info about ${video.title}`}
        className="relative block aspect-video w-full cursor-pointer"
      >
        <Artwork video={video} sizes="480px" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
        <TitleTreatment
          title={video.title}
          style={video.titleStyle}
          className="absolute bottom-3 left-4 max-w-[80%] text-left text-2xl"
        />
      </button>
      {progress !== undefined && <ProgressBar value={progress} />}

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <CircleButton label="Play (not available yet)" variant="solid" onClick={() => notify(unavailable.playback)}>
            <PlayIcon className="size-4 translate-x-px" />
          </CircleButton>
          <CircleButton label="Add to My List (not available yet)" onClick={() => notify(unavailable.myList)}>
            <PlusIcon className="size-4" />
          </CircleButton>
          <CircleButton label="More info" className="ml-auto" onClick={() => openDetails(video)}>
            <ChevronDownIcon className="size-4" />
          </CircleButton>
        </div>
        <VideoMeta video={video} isNew={isNew(video.id)} />
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-ink">
          {video.tags.map((tag, i) => (
            <span key={tag} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true" className="text-subtle">•</span>}
              {tag}
            </span>
          ))}
        </p>
      </div>
    </div>,
    document.body,
  );
}

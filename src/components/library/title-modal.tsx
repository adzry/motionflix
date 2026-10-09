"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleButton } from "@/components/ui/circle-button";
import { CloseIcon, PlayIcon, PlusIcon } from "@/components/ui/icons";
import { getCategoryConfig } from "@/config/categories";
import { unavailable } from "@/lib/feature-status";
import { formatRuntime } from "@/lib/format";
import type { Video } from "@/types/video";
import { Artwork } from "./artwork";
import { useLibraryUI } from "./library-provider";
import { TitleTreatment } from "./title-treatment";
import { VideoMeta } from "./video-meta";

const MORE_LIKE_THIS = 6;

function moreLikeThis(video: Video, all: Video[]) {
  const others = all.filter((v) => v.id !== video.id);
  const score = (v: Video) =>
    (v.category === video.category ? 10 : 0) +
    v.tags.filter((t) => video.tags.includes(t)).length;
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, MORE_LIKE_THIS);
}

/** Netflix-style "More info" modal, built on the native <dialog> element. */
export function TitleModal({
  video,
  onClose,
  onSelect,
}: {
  video: Video | null;
  onClose: () => void;
  onSelect: (video: Video) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { videos, notify, isNew } = useLibraryUI();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (video) {
      if (!dialog.open) dialog.showModal();
      dialog.scrollTo({ top: 0 });
      document.documentElement.style.overflow = "hidden";
    } else if (dialog.open) {
      dialog.close();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [video]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="title-modal-heading"
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) close();
      }}
      className="m-0 h-full max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-ink backdrop:bg-black/70 open:animate-fade-in sm:mx-auto sm:mt-8 sm:mb-8 sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:w-[min(94vw,52rem)] sm:rounded-lg"
    >
      {video && (
        <article className="min-h-full bg-surface sm:min-h-0 sm:overflow-hidden sm:rounded-lg">
          <div className="relative aspect-video w-full">
            <Artwork video={video} sizes="(min-width: 640px) 52rem, 100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
            <CircleButton
              label="Close"
              onClick={close}
              className="absolute top-3 right-3 border-0 bg-surface/90 hover:bg-surface"
            >
              <CloseIcon className="size-5" />
            </CircleButton>
            <div className="absolute inset-x-0 bottom-0 space-y-4 px-5 pb-5 sm:px-10 sm:pb-8">
              <TitleTreatment
                as="h2"
                id="title-modal-heading"
                title={video.title}
                style={video.titleStyle}
                className="max-w-[80%] text-4xl sm:text-6xl"
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => notify(unavailable.playback)} className="px-6 sm:h-11 sm:px-8">
                  <PlayIcon className="size-6" />
                  Play
                </Button>
                <CircleButton
                  label="Add to My List (not available yet)"
                  onClick={() => notify(unavailable.myList)}
                  className="size-10 sm:size-11"
                >
                  <PlusIcon className="size-5" />
                </CircleButton>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:grid-cols-[2fr_1fr] sm:px-10">
            <div className="space-y-4">
              <VideoMeta video={video} isNew={isNew(video.id)} />
              <p className="text-base leading-relaxed text-ink">{video.synopsis}</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="inline text-subtle">Genres: </dt>
                <dd className="inline">{video.tags.join(", ")}</dd>
              </div>
              <div>
                <dt className="inline text-subtle">Category: </dt>
                <dd className="inline">{getCategoryConfig(video.category).title}</dd>
              </div>
              {video.isPlaceholder && (
                <div>
                  <dt className="sr-only">Status</dt>
                  <dd>
                    <Badge tone="outline">Sample title</Badge>
                    <span className="mt-1 block text-xs text-subtle">
                      No media file yet. Playback arrives in Phase 4.
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <section aria-labelledby="more-like-this" className="px-5 pb-8 sm:px-10">
            <h3 id="more-like-this" className="mb-4 text-xl font-bold sm:text-2xl">
              More Like This
            </h3>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {moreLikeThis(video, videos).map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(v)}
                    className="group flex h-full w-full flex-col justify-start overflow-hidden rounded-md bg-surface-raised text-left transition-colors hover:bg-[#333] focus-visible:outline-2 focus-visible:outline-ink"
                  >
                    <span className="relative block aspect-video">
                      <Artwork video={v} sizes="(min-width: 640px) 16rem, 45vw" />
                      <span className="absolute top-2 right-2 rounded bg-black/70 px-1.5 text-xs font-semibold">
                        {formatRuntime(v.durationSeconds)}
                      </span>
                    </span>
                    <span className="block space-y-1.5 p-3">
                      <span className="block font-semibold">{v.title}</span>
                      <span className="line-clamp-3 block text-xs leading-relaxed text-muted sm:text-sm">
                        {v.synopsis}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </dialog>
  );
}

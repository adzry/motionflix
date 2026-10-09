import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Video } from "@/types/video";
import { PosterArt } from "./poster-art";

/**
 * Cropped 16:9 artwork for a video. Uses the poster image when present and
 * falls back to generated `PosterArt` otherwise. The parent must establish a
 * size and `position: relative`.
 */
export function Artwork({
  video,
  sizes,
  priority,
  focus,
  className,
}: {
  video: Pick<Video, "artwork" | "art" | "title">;
  /** `sizes` hint for responsive loading. */
  sizes: string;
  priority?: boolean;
  /** Override the stored focal point (e.g. for portrait crops). */
  focus?: string;
  className?: string;
}) {
  if (!video.artwork) {
    return <PosterArt art={video.art} className={cn("absolute inset-0", className)} />;
  }
  return (
    <Image
      src={video.artwork.src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      className={cn("object-cover select-none", className)}
      style={{ objectPosition: focus ?? video.artwork.focus ?? "50% 50%" }}
    />
  );
}

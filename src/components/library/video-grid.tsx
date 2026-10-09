import type { Video } from "@/types/video";
import { VideoCard } from "./video-card";

/** Wrapping grid of cards for category and search pages. */
export function VideoGrid({ videos, label }: { videos: Video[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-2 gap-x-1.5 gap-y-6 px-gutter sm:grid-cols-3 sm:gap-x-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {videos.map((video) => (
        <li key={video.id}>
          <VideoCard
            video={video}
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 19vw, (min-width: 768px) 24vw, (min-width: 640px) 32vw, 48vw"
          />
        </li>
      ))}
    </ul>
  );
}

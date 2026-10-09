/**
 * Domain types for the MotionFlix library.
 *
 * These mirror the planned `videos` / `collections` tables (see
 * docs/ARCHITECTURE.md). Field names are camelCase here and will be mapped
 * from snake_case Postgres columns in the data-access layer.
 */

/** Lifecycle of an uploaded video. Only `ready` videos are playable. */
export type VideoStatus = "uploading" | "processing" | "ready" | "failed";

/** Top-level shelves, shown as categories in the navigation. */
export type VideoCategory = "film" | "explainer" | "motion" | "experiment";

/**
 * Parameters for procedurally generated fallback art, used when a video has
 * no poster image.
 */
export interface PosterArt {
  /** Base hue in degrees (0–360). */
  hue: number;
  /** Which abstract motif to draw. */
  motif: "orbit" | "waves" | "grid" | "beams" | "rings";
}

/** A 16:9 poster / backdrop image. */
export interface Artwork {
  src: string;
  /** CSS object-position used when the image is cropped (e.g. "70% 50%"). */
  focus?: string;
}

/** Typeface used for the title treatment over artwork. */
export type TitleStyle = "display" | "serif" | "grotesk";

export interface Video {
  id: string;
  title: string;
  synopsis: string;
  durationSeconds: number;
  /** ISO 8601 timestamp of when the video was added to the library. */
  createdAt: string;
  /** Year the piece was produced. */
  year: number;
  category: VideoCategory;
  tags: string[];
  quality: "HD" | "4K";
  status: VideoStatus;
  /** Poster image; falls back to generated `art` when absent. */
  artwork?: Artwork;
  art: PosterArt;
  titleStyle: TitleStyle;
  /** True for the built-in sample catalog shown before storage exists. */
  isPlaceholder: boolean;
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  videoIds: string[];
}

/** Saved playback position. Sample-only until Phase 4. */
export interface WatchProgress {
  videoId: string;
  /** 0–1 fraction of the video watched. */
  progress: number;
}

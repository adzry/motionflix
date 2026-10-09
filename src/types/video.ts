/**
 * Domain types for the MotionFlix library.
 *
 * These mirror the planned `videos` / `collections` tables (see
 * docs/ARCHITECTURE.md). Field names are camelCase here and will be mapped
 * from snake_case Postgres columns in the data-access layer.
 */

/** Lifecycle of an uploaded video. Only `ready` videos are playable. */
export type VideoStatus = "uploading" | "processing" | "ready" | "failed";

/**
 * Visual parameters for generated placeholder artwork. Real videos will use a
 * poster image stored in R2; until then every title renders original,
 * procedurally generated art from this seed.
 */
export interface PosterArt {
  /** Base hue in degrees (0–360). */
  hue: number;
  /** Which abstract motif to draw. */
  motif: "orbit" | "waves" | "grid" | "beams" | "rings";
}

export interface Video {
  id: string;
  title: string;
  synopsis: string;
  durationSeconds: number;
  /** ISO 8601 timestamp of when the video was added to the library. */
  createdAt: string;
  tags: string[];
  status: VideoStatus;
  art: PosterArt;
  /** True for the built-in sample catalog shown before storage exists. */
  isPlaceholder: boolean;
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  videoIds: string[];
}

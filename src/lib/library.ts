import {
  placeholderCollections,
  placeholderVideos,
} from "@/lib/placeholder/catalog";
import type { Video } from "@/types/video";

/**
 * Library data-access seam.
 *
 * Every page reads library data through this module. Today it returns the
 * static placeholder catalog; in Phase 3 it will query Supabase (scoped to the
 * signed-in owner) and these functions will become server-only.
 */

export interface LibraryRow {
  id: string;
  title: string;
  videos: Video[];
}

export interface HomeLibrary {
  featured: Video | null;
  rows: LibraryRow[];
  /** True while the page is rendering sample data rather than real uploads. */
  isPlaceholder: boolean;
}

export async function getHomeLibrary(): Promise<HomeLibrary> {
  const byId = new Map(placeholderVideos.map((v) => [v.id, v]));
  const recentlyAdded = [...placeholderVideos].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const rows: LibraryRow[] = [
    { id: "recently-added", title: "Recently Added", videos: recentlyAdded },
    ...placeholderCollections.map((collection) => ({
      id: collection.id,
      title: collection.title,
      videos: collection.videoIds
        .map((id) => byId.get(id))
        .filter((v): v is Video => v !== undefined),
    })),
  ];

  return {
    featured: recentlyAdded[0] ?? null,
    rows,
    isPlaceholder: true,
  };
}

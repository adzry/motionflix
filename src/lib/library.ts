import {
  categories,
  getCategoryBySlug,
  type CategoryConfig,
} from "@/config/categories";
import {
  placeholderCollections,
  placeholderFeaturedId,
  placeholderProgress,
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
  /** "Explore all" destination, when the row maps to a category page. */
  href?: string;
  /** Watch progress (0–1) keyed by video id, for Continue Watching. */
  progress?: Record<string, number>;
}

export interface HomeLibrary {
  featured: Video | null;
  rows: LibraryRow[];
  /** True while the page is rendering sample data rather than real uploads. */
  isPlaceholder: boolean;
}

export interface CategoryLibrary {
  category: CategoryConfig;
  featured: Video | null;
  videos: Video[];
  related: LibraryRow;
  isPlaceholder: boolean;
}

const newestFirst = (a: Video, b: Video) =>
  b.createdAt.localeCompare(a.createdAt);

function byId() {
  return new Map(placeholderVideos.map((v) => [v.id, v]));
}

/** Every video in the library, newest first. */
export async function getAllVideos(): Promise<Video[]> {
  return [...placeholderVideos].sort(newestFirst);
}

export async function getHomeLibrary(): Promise<HomeLibrary> {
  const all = await getAllVideos();
  const lookup = byId();

  const continueWatching: LibraryRow = {
    id: "continue-watching",
    title: "Continue Watching",
    videos: placeholderProgress
      .map((p) => lookup.get(p.videoId))
      .filter((v): v is Video => v !== undefined),
    progress: Object.fromEntries(
      placeholderProgress.map((p) => [p.videoId, p.progress]),
    ),
  };

  const rows: LibraryRow[] = [
    { id: "recently-added", title: "Recently Added", videos: all.slice(0, 12) },
    continueWatching,
    ...categories.map((c) => ({
      id: c.slug,
      title: c.title,
      href: `/browse/${c.slug}`,
      videos: all.filter((v) => v.category === c.category),
    })),
    ...placeholderCollections.map((collection) => ({
      id: collection.id,
      title: collection.title,
      videos: collection.videoIds
        .map((id) => lookup.get(id))
        .filter((v): v is Video => v !== undefined),
    })),
  ];

  return {
    featured: lookup.get(placeholderFeaturedId) ?? all[0] ?? null,
    rows: rows.filter((r) => r.videos.length > 0),
    isPlaceholder: true,
  };
}

export async function getCategoryLibrary(
  slug: string,
): Promise<CategoryLibrary | null> {
  const category = getCategoryBySlug(slug);
  if (!category) return null;

  const all = await getAllVideos();
  const videos = all.filter((v) => v.category === category.category);

  return {
    category,
    featured: videos[0] ?? null,
    videos,
    related: {
      id: `${slug}-related`,
      title: "More to Explore",
      videos: all.filter((v) => v.category !== category.category).slice(0, 12),
    },
    isPlaceholder: true,
  };
}

/** Case-insensitive match on title, tags, synopsis and category. */
export async function searchVideos(query: string): Promise<Video[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const all = await getAllVideos();
  return all.filter((v) => {
    const category = categories.find((c) => c.category === v.category);
    const haystack = [v.title, v.synopsis, ...v.tags, category?.title ?? ""]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

import type { VideoCategory } from "@/types/video";

export interface CategoryConfig {
  slug: string;
  category: VideoCategory;
  /** Short label for the navigation bar. */
  navLabel: string;
  /** Row / page heading. */
  title: string;
  description: string;
}

export const categories: CategoryConfig[] = [
  {
    slug: "films",
    category: "film",
    navLabel: "Films",
    title: "Cinematic Films",
    description: "Story-driven pieces with mood, scale and a score.",
  },
  {
    slug: "explainers",
    category: "explainer",
    navLabel: "AI Explainers",
    title: "AI Explainers",
    description: "Clear, animated walkthroughs of ideas in AI and science.",
  },
  {
    slug: "motion-design",
    category: "motion",
    navLabel: "Motion Design",
    title: "Motion Design",
    description: "Typography, loops, transitions and brand moments.",
  },
  {
    slug: "experiments",
    category: "experiment",
    navLabel: "Experiments",
    title: "Experiments",
    description: "Sketches, studies and things that might not work.",
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryConfig(category: VideoCategory) {
  return categories.find((c) => c.category === category)!;
}

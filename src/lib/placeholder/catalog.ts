import type { Collection, Video } from "@/types/video";

/**
 * Sample catalog used ONLY to lay out the UI before Supabase and R2 are wired
 * up. These titles are fictional, have no media files, and every entry is
 * flagged `isPlaceholder: true`. Delete this module once real data flows
 * through `src/lib/library.ts`.
 */

type Seed = Omit<Video, "isPlaceholder" | "status">;

const seeds: Seed[] = [
  {
    id: "ph-signal-bloom",
    title: "Signal Bloom",
    synopsis:
      "Particles gather into a slow-blooming lattice of light, then scatter on a single beat.",
    durationSeconds: 94,
    createdAt: "2026-10-02T09:00:00Z",
    tags: ["Abstract", "Particles"],
    art: { hue: 340, motif: "orbit" },
  },
  {
    id: "ph-tidal-type",
    title: "Tidal Type",
    synopsis: "Kinetic typography that rolls in and out like a tide.",
    durationSeconds: 48,
    createdAt: "2026-09-29T09:00:00Z",
    tags: ["Typography"],
    art: { hue: 200, motif: "waves" },
  },
  {
    id: "ph-quiet-grid",
    title: "Quiet Grid",
    synopsis: "A minimalist grid breathes in sync with an ambient score.",
    durationSeconds: 125,
    createdAt: "2026-09-27T09:00:00Z",
    tags: ["Minimal", "Loop"],
    art: { hue: 160, motif: "grid" },
  },
  {
    id: "ph-neon-transit",
    title: "Neon Transit",
    synopsis: "Light beams race across a night-time transit map.",
    durationSeconds: 72,
    createdAt: "2026-09-25T09:00:00Z",
    tags: ["Data Viz"],
    art: { hue: 280, motif: "beams" },
  },
  {
    id: "ph-solar-rings",
    title: "Solar Rings",
    synopsis: "Concentric rings pulse outward from a warm core.",
    durationSeconds: 60,
    createdAt: "2026-09-22T09:00:00Z",
    tags: ["Abstract", "Loop"],
    art: { hue: 30, motif: "rings" },
  },
  {
    id: "ph-paper-orbit",
    title: "Paper Orbit",
    synopsis: "Cut-paper planets drift through a hand-made solar system.",
    durationSeconds: 156,
    createdAt: "2026-09-18T09:00:00Z",
    tags: ["Explainer"],
    art: { hue: 50, motif: "orbit" },
  },
  {
    id: "ph-glass-waves",
    title: "Glass Waves",
    synopsis: "Refractive waves bend a logo into a hundred reflections.",
    durationSeconds: 36,
    createdAt: "2026-09-15T09:00:00Z",
    tags: ["Logo", "Brand"],
    art: { hue: 185, motif: "waves" },
  },
  {
    id: "ph-chart-lines",
    title: "Chart Lines",
    synopsis: "A quarterly report reimagined as a racing line chart.",
    durationSeconds: 88,
    createdAt: "2026-09-11T09:00:00Z",
    tags: ["Data Viz", "Explainer"],
    art: { hue: 120, motif: "grid" },
  },
  {
    id: "ph-ember-beams",
    title: "Ember Beams",
    synopsis: "Glowing embers rise and resolve into a title card.",
    durationSeconds: 42,
    createdAt: "2026-09-08T09:00:00Z",
    tags: ["Title Card"],
    art: { hue: 12, motif: "beams" },
  },
  {
    id: "ph-violet-hours",
    title: "Violet Hours",
    synopsis: "A slow dusk gradient with drifting rings of light.",
    durationSeconds: 210,
    createdAt: "2026-09-03T09:00:00Z",
    tags: ["Ambient", "Loop"],
    art: { hue: 260, motif: "rings" },
  },
];

export const placeholderVideos: Video[] = seeds.map((seed) => ({
  ...seed,
  status: "ready",
  isPlaceholder: true,
}));

export const placeholderCollections: Collection[] = [
  {
    id: "ph-col-abstract",
    title: "Abstract & Ambient",
    videoIds: [
      "ph-signal-bloom",
      "ph-solar-rings",
      "ph-violet-hours",
      "ph-quiet-grid",
      "ph-glass-waves",
    ],
  },
  {
    id: "ph-col-explainers",
    title: "Explainers & Data",
    videoIds: [
      "ph-chart-lines",
      "ph-neon-transit",
      "ph-paper-orbit",
      "ph-tidal-type",
    ],
  },
  {
    id: "ph-col-brand",
    title: "Titles & Brand Moments",
    videoIds: ["ph-ember-beams", "ph-glass-waves", "ph-tidal-type"],
  },
];

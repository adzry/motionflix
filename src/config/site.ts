import { categories } from "./categories";

export const siteConfig = {
  name: "MotionFlix",
  tagline: "Your private screening room for Claude Motion Studio renders.",
  description:
    "A private, personal video library for videos produced with Claude Motion Studio.",
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Rendered as non-interactive "Soon" items until the feature exists. */
  comingSoon?: boolean;
}

/**
 * Primary navigation. Category pages are real routes over the sample catalog;
 * features that don't exist yet are flagged `comingSoon` so nothing links to
 * a 404.
 */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  ...categories.map((c) => ({ label: c.navLabel, href: `/browse/${c.slug}` })),
  { label: "My List", href: "/my-list", comingSoon: true },
];

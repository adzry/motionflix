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
 * Primary navigation. Items without a real route yet point at sections of the
 * home page or are flagged `comingSoon` so the UI never links to a 404.
 */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Recently Added", href: "/#recently-added" },
  { label: "Collections", href: "/#collections" },
  { label: "Upload", href: "/upload", comingSoon: true },
];

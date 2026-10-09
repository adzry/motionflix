/**
 * User-facing copy for features that are intentionally not built yet.
 * Keep these honest: they are shown when someone tries an unavailable action.
 */
export const unavailable = {
  playback:
    "Playback isn't available yet. It arrives with private cloud storage in Phase 4.",
  myList: "My List isn't available yet. It needs sign-in (Phase 2) and a database (Phase 3).",
  profiles: "Profiles and sign-in aren't available yet. They arrive in Phase 2.",
  notifications: "Notifications aren't available yet.",
} as const;

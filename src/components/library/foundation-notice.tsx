/**
 * Honest status banner shown while the library renders sample data.
 * Remove once real uploads are served (see docs/ROADMAP.md).
 */
export function FoundationNotice() {
  return (
    <aside
      aria-label="Project status"
      className="mx-4 rounded-lg border border-line bg-surface/80 px-4 py-3 text-sm text-muted sm:mx-8 lg:mx-12"
    >
      <strong className="font-semibold text-ink">Foundation preview.</strong>{" "}
      These are sample titles with generated artwork. Sign-in, cloud storage,
      uploads and playback are not implemented yet.
    </aside>
  );
}

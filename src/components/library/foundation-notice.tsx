/**
 * Honest status line shown while the library renders sample data.
 * Remove once real uploads are served (see docs/ROADMAP.md).
 */
export function FoundationNotice() {
  return (
    <p role="note" className="px-gutter text-xs text-subtle sm:text-sm">
      <span className="mr-2 rounded-sm border border-white/25 px-1.5 py-px text-[10px] font-semibold tracking-wider text-muted uppercase">
        Sample library
      </span>
      Titles and artwork are placeholders. Playback, uploads, My List and sign-in
      aren&apos;t built yet.
    </p>
  );
}

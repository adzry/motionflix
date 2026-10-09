import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60 px-4 py-10 text-sm text-subtle sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {siteConfig.name} — a private, personal library. Not affiliated with
          Netflix.
        </p>
        <p>Foundation build · sample artwork is procedurally generated.</p>
      </div>
    </footer>
  );
}

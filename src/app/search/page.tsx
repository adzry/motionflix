import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VideoGrid } from "@/components/library/video-grid";
import { categories } from "@/config/categories";
import { searchVideos } from "@/lib/library";

export const metadata: Metadata = { title: "Search" };

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  if (!query) {
    return (
      <div className="px-gutter">
        <h1 className="text-2xl font-bold">Search your library</h1>
        <p className="mt-2 text-muted">Use the search box above, or jump into a category:</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/browse/${c.slug}`}
                className="block rounded-full border border-white/40 px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-white/10"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const results = await searchVideos(query);

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-gutter py-16 text-center text-muted">
        <p className="text-lg text-ink">
          Your search for &ldquo;{query}&rdquo; did not have any matches.
        </p>
        <p className="mt-4">Suggestions:</p>
        <ul className="mt-2 list-inside list-disc text-left sm:text-center">
          <li>Try different keywords</li>
          <li>Try a genre, like &ldquo;Sci-Fi&rdquo; or &ldquo;Loop&rdquo;</li>
          <li>Try a category, like &ldquo;Explainers&rdquo;</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="px-gutter text-muted">
        {results.length} {results.length === 1 ? "result" : "results"} for{" "}
        <span className="text-ink">&ldquo;{query}&rdquo;</span>
      </p>
      <VideoGrid videos={results} label="Search results" />
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="min-h-[70vh] pt-28 pb-8 md:pt-32">
      <Suspense fallback={<p className="px-gutter text-muted">Searching…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FeaturedHero } from "@/components/library/featured-hero";
import { FoundationNotice } from "@/components/library/foundation-notice";
import { VideoGrid } from "@/components/library/video-grid";
import { VideoRow } from "@/components/library/video-row";
import { categories, getCategoryBySlug } from "@/config/categories";
import { getCategoryLibrary } from "@/lib/library";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/browse/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCategoryBySlug(slug)?.title ?? "Not found" };
}

async function CategoryContent({ params }: { params: PageProps<"/browse/[slug]">["params"] }) {
  const { slug } = await params;
  const library = await getCategoryLibrary(slug);
  if (!library) notFound();
  const { category, featured, videos, related, isPlaceholder } = library;

  return (
    <>
      {featured && <FeaturedHero video={featured} eyebrow={category.title} />}

      <div className="relative z-10 space-y-10 pb-8 md:-mt-[7vw] lg:space-y-12">
        <section aria-labelledby="category-heading" className="space-y-4">
          <div className="px-gutter">
            <h2 id="category-heading" className="text-2xl font-bold md:text-3xl">
              {category.title}
            </h2>
            <p className="mt-1 text-sm text-muted md:text-base">{category.description}</p>
          </div>
          <VideoGrid videos={videos} label={`${category.title} titles`} />
        </section>

        <VideoRow row={related} />
        {isPlaceholder && <FoundationNotice />}
      </div>
    </>
  );
}

/** Shared App Shell placeholder shown while the category content streams in. */
function CategorySkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-[70svh] bg-gradient-to-b from-surface-raised/40 to-canvas md:h-[56.25vw] md:max-h-[92vh] md:min-h-[520px]" />
      <div className="flex gap-2 overflow-hidden px-gutter">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-video w-[44%] shrink-0 rounded bg-surface-raised/60 sm:w-[31%] md:w-[23.6%] lg:w-[18.9%] xl:w-[15.8%]" />
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: PageProps<"/browse/[slug]">) {
  // URL data is read inside <Suspense> so the route's App Shell stays
  // shareable across categories (Partial Prefetching / instant navigation).
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

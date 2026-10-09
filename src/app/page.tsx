import { FeaturedHero } from "@/components/library/featured-hero";
import { FoundationNotice } from "@/components/library/foundation-notice";
import { VideoRow } from "@/components/library/video-row";
import { getHomeLibrary } from "@/lib/library";

export default async function HomePage() {
  const { featured, rows, isPlaceholder } = await getHomeLibrary();

  return (
    <>
      {featured && <FeaturedHero video={featured} eyebrow="Film" />}

      <div className="relative z-10 space-y-6 pb-8 md:-mt-[9vw] md:space-y-10 lg:space-y-12">
        {rows.map((row) => (
          <VideoRow key={row.id} row={row} />
        ))}
        {isPlaceholder && <FoundationNotice />}
      </div>
    </>
  );
}

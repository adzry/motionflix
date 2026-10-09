import { FeaturedHero } from "@/components/library/featured-hero";
import { FoundationNotice } from "@/components/library/foundation-notice";
import { VideoRow } from "@/components/library/video-row";
import { getHomeLibrary } from "@/lib/library";

export default async function HomePage() {
  const { featured, rows, isPlaceholder } = await getHomeLibrary();
  const [firstRow, ...collectionRows] = rows;

  return (
    <>
      {featured && <FeaturedHero video={featured} />}

      <div className="relative z-10 -mt-10 space-y-8 pb-12 sm:-mt-16 sm:space-y-10">
        {isPlaceholder && <FoundationNotice />}

        {firstRow && (
          <VideoRow id={firstRow.id} title={firstRow.title} videos={firstRow.videos} />
        )}

        {collectionRows.length > 0 && (
          <div id="collections" className="space-y-8 sm:space-y-10">
            {collectionRows.map((row) => (
              <VideoRow key={row.id} id={row.id} title={row.title} videos={row.videos} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { Suspense } from "react";
import { getBoxOffice, searchMovieTMDB } from "@/lib/api";
import BoxOfficeSection from "@/components/dashboard/BoxOfficeSection";
import CurationBanner from "@/components/dashboard/CurationBanner";
import LatestReviews from "@/components/dashboard/LatestReviews";
import SignoutHandler from "@/components/layout/SignoutHandler";
import { BoxOfficeMovie } from "@/types";

export const revalidate = 3600;

async function getBoxOfficeWithPosters(): Promise<BoxOfficeMovie[]> {
  let raw;
  try {
    raw = await getBoxOffice();
  } catch (err) {
    console.error("[영진위] 박스오피스 조회 실패:", err);
    return [];
  }

  const movies = await Promise.all(
    raw.slice(0, 10).map(async (item: any) => {
      const openYear = item.openDt ? String(item.openDt).slice(0, 4) : undefined;
      const tmdb = await searchMovieTMDB(item.movieNm, openYear).catch(() => null);
      return {
        rank: Number(item.rnum),
        title: item.movieNm,
        openDt: item.openDt,
        audiCnt: Number(item.audiCnt).toLocaleString(),
        audiAcc: Number(item.audiAcc).toLocaleString(),
        tmdbData: tmdb
          ? {
              id: tmdb.id,
              title: tmdb.title,
              poster_path: tmdb.poster_path,
              release_date: tmdb.release_date,
            }
          : undefined,
      };
    })
  );

  return movies;
}

async function DashboardContent() {
  const boxOffice = await getBoxOfficeWithPosters();
  return <BoxOfficeSection movies={boxOffice} />;
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Suspense fallback={null}>
        <SignoutHandler />
      </Suspense>
      <Suspense fallback={<BoxOfficeSkeleton />}>
        <DashboardContent />
      </Suspense>
      <CurationBanner />
      <LatestReviews />
    </div>
  );
}

function BoxOfficeSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="w-full aspect-[2/3] bg-gray-800 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        {[4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 last:border-0">
            <div className="w-5 h-4 bg-gray-800 rounded animate-pulse" />
            <div className="w-8 h-12 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 flex-1 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
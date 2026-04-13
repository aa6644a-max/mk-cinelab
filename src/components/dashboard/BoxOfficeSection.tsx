import Link from "next/link";
import Image from "next/image";
import { BoxOfficeMovie } from "@/types";

interface Props {
  movies: BoxOfficeMovie[];
}

function getTimeStr() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} 기준`;
}

export default function BoxOfficeSection({ movies }: Props) {
  const top3 = movies.slice(0, 3);
  const rest = movies.slice(3);

  return (
    <section>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">실시간 박스오피스</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            영진위 제공
          </span>
          <span className="hidden sm:block">{getTimeStr()}</span>
        </div>
      </div>

      {/* TOP 3 — 모바일: 가로 스크롤 / 데스크탑: 3열 그리드 */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 mb-4 scrollbar-hide">
        {top3.map((movie) => (
          <Link
            key={movie.rank}
            href={movie.tmdbData?.id ? "/movie/tmdb-" + movie.tmdbData.id : "#"}
            className="group flex-shrink-0 w-36 md:w-auto"
          >
            <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all">
              {/* 순위 뱃지 */}
              <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {movie.rank}
              </div>

              {/* 포스터 */}
              {movie.tmdbData?.poster_path ? (
                <Image
                  src={"https://image.tmdb.org/t/p/w780" + movie.tmdbData.poster_path}
                  alt={movie.title}
                  width={400}
                  height={600}
                  sizes="(max-width: 768px) 144px, 300px"
                  className="w-full aspect-[2/3] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center p-4">
                  <span className="text-xs text-gray-400 text-center font-medium leading-snug">
                    {movie.title}
                  </span>
                </div>
              )}

              {/* 하단 정보 */}
              <div className="p-2 md:p-3">
                <p className="text-xs md:text-sm font-medium text-white truncate">{movie.title}</p>
                <p className="text-[10px] md:text-xs text-red-500 mt-0.5">일일 {movie.audiCnt}명</p>
                <p className="text-[10px] md:text-xs text-gray-600">누적 {movie.audiAcc}명</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 4~10위 리스트 */}
      <div className="border border-gray-800 rounded-xl divide-y divide-gray-800 overflow-hidden">
        {rest.map((movie) => (
          <Link
            key={movie.rank}
            href={movie.tmdbData?.id ? "/movie/tmdb-" + movie.tmdbData.id : "#"}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition-colors"
          >
            <span className="text-sm text-gray-500 w-5 text-center flex-shrink-0">{movie.rank}</span>
            {movie.tmdbData?.poster_path ? (
              <Image
                src={"https://image.tmdb.org/t/p/w185" + movie.tmdbData.poster_path}
                alt={movie.title}
                width={32}
                height={48}
                className="rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-12 bg-gray-800 rounded flex-shrink-0" />
            )}
            <span className="text-sm text-gray-200 flex-1 truncate">{movie.title}</span>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-red-500">{movie.audiCnt}명</div>
              <div className="text-[10px] text-gray-600">누적 {movie.audiAcc}명</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
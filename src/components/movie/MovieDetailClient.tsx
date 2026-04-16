"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Film, Sparkles, ShieldCheck, PenLine, ArrowLeft } from "lucide-react";
import { useState } from "react";

const STYLE_LABELS: Record<string, string> = {
  critic: "평론가 모드",
  emotional: "감성 모드",
  blog: "블로그 모드",
  sns: "SNS 모드",
};
function OverviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text?.length > 150;

  if (!text) return (
    <p className="text-sm text-gray-400">줄거리 정보가 없습니다.</p>
  );

  return (
    <div>
      <p className="text-sm text-gray-400 leading-relaxed">
        {expanded || !isLong ? text : text.slice(0, 150) + "..."}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-red-500 hover:text-red-400 mt-1.5 transition-colors"
        >
          {expanded ? "접기 ↑" : "더보기 ↓"}
        </button>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (day > 0) return day + "일 전";
  if (hour > 0) return hour + "시간 전";
  if (min > 0) return min + "분 전";
  return "방금 전";
}

export default function MovieDetailClient({ movie, reviews }: { movie: any; reviews: any[] }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> 대시보드로
      </Link>

      <div className="relative rounded-2xl overflow-hidden border border-gray-800 mb-8">
  {movie.backdrop_path && (
    <div className="absolute inset-0">
      <Image
        src={"https://image.tmdb.org/t/p/w1280" + movie.backdrop_path}
        alt={movie.title}
        fill
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
    </div>
  )}
        <div className="relative flex flex-col md:flex-row gap-4 md:gap-6 p-5 md:p-8">
    {/* 포스터 — 모바일에서 중앙 정렬 */}
    <div className="flex-shrink-0 flex justify-center md:block">
      {movie.poster_path ? (
        <Image
          src={"https://image.tmdb.org/t/p/w300" + movie.poster_path}
          alt={movie.title}
          width={140}
          height={210}
          className="rounded-xl object-cover shadow-2xl"
        />
      ) : (
        <div className="w-[140px] h-[210px] bg-gray-800 rounded-xl flex items-center justify-center">
          <Film className="w-10 h-10 text-gray-600" />
        </div>
      )}
    </div>
          <div className="flex-1 min-w-0">
      <h1 className="text-xl md:text-3xl font-black text-white mb-1 leading-tight">
        {movie.title}
      </h1>
      {movie.original_title !== movie.title && (
        <p className="text-sm text-gray-500 mb-3">{movie.original_title}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {movie.genres.map((g: any) => (
          <span key={g.id} className="text-xs border border-gray-700 text-gray-400 px-2.5 py-1 rounded-full">
            {g.name}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-300">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-white">{movie.vote_average.toFixed(1)}</span>
          <span className="text-gray-500 text-xs">({movie.vote_count.toLocaleString()}명)</span>
        </div>
        {movie.runtime > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-gray-500" />{movie.runtime}분
          </div>
        )}
        {movie.release_date && (
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-gray-500" />{movie.release_date.slice(0, 4)}
          </div>
        )}
      </div>
      {movie.director && (
        <p className="text-sm text-gray-400 mb-4">
          <span className="text-gray-600">감독</span>{" "}
          <Link
            href={`/person/${movie.director.id}`}
            className="text-white font-medium hover:text-red-400 transition-colors"
          >
            {movie.director.name}
          </Link>
        </p>
      )}
      <OverviewText text={movie.overview} />
    </div>
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-1 space-y-6">
          {movie.cast.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-3">출연진</h2>
              <div className="space-y-2">
                {movie.cast.map((actor: any) => (
                  <Link key={actor.id} href={`/person/${actor.id}`} className="flex items-center gap-2.5 group hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-colors">
                    {actor.profile_path ? (
                      <Image src={"https://image.tmdb.org/t/p/w92" + actor.profile_path} alt={actor.name} width={32} height={32} className="rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs text-gray-500">{actor.name[0]}</div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">{actor.name}</p>
                      <p className="text-[10px] text-gray-600">{actor.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {movie.similar.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-3">비슷한 영화</h2>
              <div className="space-y-2">
                {movie.similar.map((s: any) => (
                  <Link key={s.id} href={"/movie/tmdb-" + s.id} className="flex items-center gap-2.5 hover:bg-gray-900 rounded-lg p-1.5 transition-colors">
                    {s.poster_path ? (
                      <Image src={"https://image.tmdb.org/t/p/w92" + s.poster_path} alt={s.title} width={36} height={54} className="rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-[54px] bg-gray-800 rounded flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-300">{s.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] text-gray-500">{s.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">
              리뷰
              {reviews.length > 0 && <span className="text-gray-500 font-normal ml-2">{reviews.length}개</span>}
            </h2>
            <Link href={`/review-lab?tmdbId=${movie.id}&title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(movie.poster_path ?? "")}&year=${movie.release_date?.slice(0, 4) ?? ""}&rating=${movie.vote_average ?? 0}&genres=${encodeURIComponent(movie.genres.map((g: any) => g.id).join(","))}`}>
              <button className="text-xs text-red-500 border border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-950/30 transition-colors">
                리뷰 작성하기
              </button>
            </Link>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl text-gray-600">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">아직 작성된 리뷰가 없습니다</p>
              <p className="text-xs mt-1">첫 번째 리뷰를 작성해보세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review: any) => {
                const profile = review.profiles;
                return (
                  <Link
                    key={review.id}
                    href={`/review/${review.id}`}
                    className="block bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer"
                  >
                    {/* 작성자 */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt={profile.nickname} width={22} height={22} className="rounded-full" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                          {(profile?.nickname ?? "?")[0]}
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-300">{profile?.nickname ?? "익명"}</span>
                      {profile?.is_trusted && (
                        <span className="flex items-center gap-0.5 text-[10px] border border-teal-800 text-teal-400 px-1.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-2 h-2" /> 신뢰 마크
                        </span>
                      )}
                      {review.is_ai_assisted && (
                        <span className="flex items-center gap-0.5 text-[10px] border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded-full">
                          <Sparkles className="w-2 h-2" /> AI Assisted
                        </span>
                      )}
                      {review.is_user_edited && (
                        <span className="flex items-center gap-0.5 text-[10px] border border-amber-800 text-amber-400 px-1.5 py-0.5 rounded-full">
                          <PenLine className="w-2 h-2" /> 사용자 검수
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 ml-auto">{getTimeAgo(review.created_at)}</span>
                    </div>

                    {/* 미리보기 (3줄 제한) */}
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{review.content}</p>

                    {/* 하단 메타 */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                      <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full">
                        {STYLE_LABELS[review.style] ?? review.style}
                      </span>
                      {review.input_keywords?.slice(0, 3).map((kw: string) => (
                        <span key={kw} className="text-[10px] text-gray-600">{kw}</span>
                      ))}
                      <span className="text-[10px] text-red-500 ml-auto">전체 리뷰 보기 →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
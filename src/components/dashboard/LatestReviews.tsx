"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const STYLE_LABELS: Record<string, string> = {
  critic: "평론가 모드",
  emotional: "감성 모드",
  blog: "블로그 모드",
  sns: "SNS 모드",
};

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

const PER_PAGE = 3;

export default function LatestReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const fetchReviews = async (currentPage: number, silent = false) => {
    if (!silent) setIsLoading(true);
    const from = (currentPage - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    const { data, count } = await supabase
      .from("reviews")
      .select(`
        id, movie_title, movie_poster, content,
        style, is_ai_assisted, guest_nickname,
        match_score, created_at,
        profiles ( nickname, avatar_url )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    setReviews(data ?? []);
    setTotalCount(count ?? 0);
    if (!silent) setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews(page);

    // 탭 복귀 시 로딩 표시 없이 조용히 갱신
    const handleFocus = () => fetchReviews(page, true);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [page]);

  if (!isLoading && totalCount === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">최신 리뷰</h2>
          {totalCount > 0 && (
            <span className="text-xs text-gray-600">총 {totalCount}개</span>
          )}
        </div>
        <Link href="/board" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          전체 보기 →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => {
            const profile = review.profiles;
            const nickname = profile?.nickname ?? review.guest_nickname ?? "익명";
            return (
              <Link key={review.id} href={"/review/" + review.id} className="block" prefetch={false}>
                <div className="flex gap-0 bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all">
                  <div className="w-14 flex-shrink-0 bg-gray-800 self-stretch">
                    {review.movie_poster ? (
                      <Image
                        src={review.movie_poster}
                        alt={review.movie_title}
                        width={56}
                        height={84}
                        className="w-full h-full object-cover"
                        style={{ minHeight: "84px" }}
                      />
                    ) : (
                      <div className="w-full min-h-[84px] flex items-center justify-center">
                        <Film className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[9px] text-gray-400 flex-shrink-0">
                        {nickname[0]}
                      </div>
                      <span className="text-xs text-gray-400">{nickname}</span>
                      {review.is_ai_assisted && (
                        <span className="flex items-center gap-0.5 text-[9px] border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded-full">
                          <Sparkles className="w-2 h-2" /> AI
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 ml-auto">
                        {getTimeAgo(review.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-red-500 font-semibold mb-1">{review.movie_title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{review.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full">
                        {STYLE_LABELS[review.style] ?? review.style}
                      </span>
                      <span className="text-[10px] text-gray-600 ml-auto">
                        반영도 {review.match_score}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
              if (p === page - 3 || p === page + 3) {
                return <span key={p} className="text-xs text-gray-600">...</span>;
              }
              return null;
            }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-medium transition-colors",
                  page === p
                    ? "bg-white text-black"
                    : "border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white"
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
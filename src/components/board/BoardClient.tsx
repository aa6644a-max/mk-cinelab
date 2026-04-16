"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film, ShieldCheck, Sparkles, PenLine, Clock,
  Search, X, LayoutGrid, List, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "critic", label: "평론가" },
  { value: "emotional", label: "감성" },
  { value: "blog", label: "블로그" },
  { value: "sns", label: "SNS" },
];

const BADGE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "trusted", label: "신뢰마크" },
  { value: "ai", label: "AI Assisted" },
  { value: "edited", label: "사용자 검수" },
];

const SCORE_OPTIONS = [
  { value: 0, label: "전체" },
  { value: 70, label: "70+" },
  { value: 80, label: "80+" },
  { value: 90, label: "90+" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "score", label: "반영도순" },
];

const STYLE_LABELS: Record<string, string> = {
  critic: "평론가",
  emotional: "감성",
  blog: "블로그",
  sns: "SNS",
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

// ─── 카드형 아이템 ────────────────────────────────────────────────
function CardItem({ review }: { review: any }) {
  const profile = review.profiles;
  return (
    <Link href={`/review/${review.id}`} className="block group">
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all group-hover:bg-gray-900/80">
        <div className="flex">
          <div className="w-[88px] flex-shrink-0 bg-gray-800 self-stretch">
            {review.movie_poster ? (
              <Image
                src={review.movie_poster}
                alt={review.movie_title}
                width={88}
                height={132}
                className="w-full h-full object-cover"
                style={{ minHeight: "120px" }}
              />
            ) : (
              <div className="w-full min-h-[120px] flex items-center justify-center">
                <Film className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 min-w-0">
            {/* 작성자 */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.nickname} width={18} height={18} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-[18px] h-[18px] rounded-full bg-gray-700 flex items-center justify-center text-[9px] text-gray-400 flex-shrink-0">
                  {(profile?.nickname ?? "?")[0]}
                </div>
              )}
              <span className="text-xs text-gray-300 font-medium">
                {profile?.nickname ?? review.guest_nickname ?? "익명"}
              </span>
              {profile?.is_trusted && (
                <span className="flex items-center gap-0.5 text-[9px] border border-teal-700 text-teal-400 bg-teal-950/30 px-1.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-2 h-2" /> 신뢰
                </span>
              )}
              {review.is_ai_assisted && (
                <span className="flex items-center gap-0.5 text-[9px] border border-purple-700 text-purple-400 bg-purple-950/30 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="w-2 h-2" /> AI
                </span>
              )}
              {review.is_user_edited && (
                <span className="flex items-center gap-0.5 text-[9px] border border-amber-700 text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded-full">
                  <PenLine className="w-2 h-2" /> 검수
                </span>
              )}
              <span className="flex items-center gap-0.5 text-[9px] text-gray-600 ml-auto flex-shrink-0">
                <Clock className="w-2 h-2" />{getTimeAgo(review.created_at)}
              </span>
            </div>
            {/* 영화 제목 */}
            <p className="text-xs text-red-500 font-semibold mb-1 truncate">{review.movie_title}</p>
            {/* 내용 */}
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{review.content}</p>
            {/* 하단 메타 */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] text-gray-600 border border-gray-800 px-2 py-0.5 rounded-full">
                {STYLE_LABELS[review.style] ?? review.style}
              </span>
              {review.input_keywords?.slice(0, 2).map((kw: string) => (
                <span key={kw} className="text-[10px] text-gray-600">{kw}</span>
              ))}
              <span className="text-[10px] text-gray-600 ml-auto">반영도 {review.match_score}%</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── 리스트형 아이템 ──────────────────────────────────────────────
function ListItem({ review }: { review: any }) {
  const profile = review.profiles;
  return (
    <Link href={`/review/${review.id}`} className="block group">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors">
        {/* 포스터 썸네일 */}
        {review.movie_poster ? (
          <Image
            src={review.movie_poster}
            alt={review.movie_title}
            width={32}
            height={48}
            className="rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Film className="w-3 h-3 text-gray-600" />
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-red-500 font-semibold truncate">{review.movie_title}</span>
            <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {STYLE_LABELS[review.style] ?? review.style}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">{review.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-500">
              {profile?.nickname ?? review.guest_nickname ?? "익명"}
            </span>
            {profile?.is_trusted && <ShieldCheck className="w-2.5 h-2.5 text-teal-400" />}
            {review.is_ai_assisted && <Sparkles className="w-2.5 h-2.5 text-purple-400" />}
            {review.is_user_edited && <PenLine className="w-2.5 h-2.5 text-amber-400" />}
          </div>
        </div>

        {/* 우측 메타 */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-bold text-red-400">{review.match_score}%</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{getTimeAgo(review.created_at)}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── 필터 칩 ─────────────────────────────────────────────────────
function FilterChip({
  options,
  value,
  onChange,
}: {
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "text-[11px] px-2.5 py-1 rounded-lg border transition-colors",
            value === opt.value
              ? "bg-red-600 border-red-600 text-white"
              : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function BoardClient() {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [style, setStyle] = useState("");
  const [badge, setBadge] = useState("");
  const [scoreMin, setScoreMin] = useState(0);
  const [page, setPage] = useState(1);

  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchReviews = useCallback((params: {
    page: number; sort: string; search: string;
    style: string; badge: string; scoreMin: number;
  }) => {
    setLoading(true);
    const qs = new URLSearchParams({
      page: String(params.page),
      sort: params.sort,
      search: params.search,
      style: params.style,
      badge: params.badge,
      score_min: String(params.scoreMin),
    });
    fetch(`/api/board?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setReviews(d.reviews ?? []);
          setTotal(d.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 필터/정렬 변경 시 1페이지로 리셋
  useEffect(() => {
    setPage(1);
    fetchReviews({ page: 1, sort, search, style, badge, scoreMin });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search, style, badge, scoreMin]);

  // 페이지 변경
  useEffect(() => {
    fetchReviews({ page, sort, search, style, badge, scoreMin });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 검색 디바운스
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  const activeFilterCount = [style, badge, scoreMin > 0 ? "score" : ""].filter(Boolean).length;

  const changePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">리뷰 보드</h1>
          <p className="text-xs text-gray-500 mt-0.5">총 {total}개의 리뷰</p>
        </div>
        {/* 뷰 토글 + 정렬 */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border border-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "card" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300")}
              title="카드형"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300")}
              title="리스트형"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                sort === s.value
                  ? "bg-white text-black border-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 + 필터 */}
      <div className="mb-5 space-y-3">
        {/* 검색창 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="영화 제목으로 검색"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-xl border transition-colors",
              filtersOpen || activeFilterCount > 0
                ? "border-red-700 text-red-400 bg-red-950/20"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            )}
          >
            필터
            {activeFilterCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 필터 패널 */}
        {filtersOpen && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">필터</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setStyle(""); setBadge(""); setScoreMin(0); }}
                  className="text-[11px] text-gray-500 hover:text-red-400 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-gray-600 mb-2">스타일</p>
                <FilterChip options={STYLE_OPTIONS} value={style} onChange={(v) => setStyle(v as string)} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 mb-2">배지</p>
                <FilterChip options={BADGE_OPTIONS} value={badge} onChange={(v) => setBadge(v as string)} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 mb-2">최소 반영도</p>
                <FilterChip options={SCORE_OPTIONS} value={scoreMin} onChange={(v) => setScoreMin(v as number)} />
              </div>
            </div>
          </div>
        )}

        {/* 활성 필터 태그 */}
        {activeFilterCount > 0 && !filtersOpen && (
          <div className="flex items-center gap-2 flex-wrap">
            {style && (
              <span className="flex items-center gap-1 text-[11px] bg-red-950/30 border border-red-800 text-red-400 px-2 py-1 rounded-lg">
                {STYLE_OPTIONS.find((o) => o.value === style)?.label}
                <button onClick={() => setStyle("")}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {badge && (
              <span className="flex items-center gap-1 text-[11px] bg-red-950/30 border border-red-800 text-red-400 px-2 py-1 rounded-lg">
                {BADGE_OPTIONS.find((o) => o.value === badge)?.label}
                <button onClick={() => setBadge("")}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {scoreMin > 0 && (
              <span className="flex items-center gap-1 text-[11px] bg-red-950/30 border border-red-800 text-red-400 px-2 py-1 rounded-lg">
                반영도 {scoreMin}+
                <button onClick={() => setScoreMin(0)}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 리뷰 목록 */}
      {loading ? (
        <div className={cn(
          viewMode === "list"
            ? "bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800"
            : "space-y-4"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            viewMode === "list" ? (
              <div key={i} className="h-16 px-4 py-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-12 bg-gray-800 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-800 rounded w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="h-32 bg-gray-900 rounded-2xl animate-pulse" />
            )
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">조건에 맞는 리뷰가 없습니다</p>
          {(search || activeFilterCount > 0) && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); setStyle(""); setBadge(""); setScoreMin(0); }}
              className="text-xs text-gray-500 hover:text-red-400 mt-2 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-4">
          {reviews.map((review) => <CardItem key={review.id} review={review} />)}
        </div>
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          {reviews.map((review) => <ListItem key={review.id} review={review} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-600 text-xs">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => changePage(p as number)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                      page === p
                        ? "bg-red-600 text-white"
                        : "border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

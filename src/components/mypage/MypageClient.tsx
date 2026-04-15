"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film, ShieldCheck, Sparkles, PenLine,
  BarChart2, Clock, Star, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface Review {
  id: string;
  user_id?: string;
  movie_title: string;
  movie_poster: string | null;
  content: string;
  style: string;
  input_keywords: string[];
  match_score: number;
  is_ai_assisted: boolean;
  is_user_edited: boolean;
  created_at: string;
}

interface Profile {
  nickname: string;
  avatar_url: string | null;
  is_trusted: boolean;
  review_count: number;
}

const STYLE_LABELS: Record<string, string> = {
  critic: "평론가 모드",
  emotional: "감성 모드",
  blog: "블로그 모드",
  sns: "SNS 모드",
};

function analyzeGenreMap(reviews: Review[]) {
  const keywordCount: Record<string, number> = {};
  reviews.forEach((r) => {
    r.input_keywords.forEach((kw) => {
      const clean = kw.replace("#", "");
      keywordCount[clean] = (keywordCount[clean] ?? 0) + 1;
    });
  });
  return Object.entries(keywordCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function analyzeStyleMap(reviews: Review[]) {
  const styleCount: Record<string, number> = {};
  reviews.forEach((r) => {
    styleCount[r.style] = (styleCount[r.style] ?? 0) + 1;
  });
  return styleCount;
}

function GenreChart({ data }: { data: [string, number][] }) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
      리뷰를 작성하면 취향 분석이 생성됩니다
    </div>
  );
  const max = Math.max(...data.map(([, v]) => v));
  return (
    <div className="space-y-2">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-20 text-right flex-shrink-0">{label}</span>
          <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-full transition-all duration-700"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function StyleDonut({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const colors: Record<string, string> = {
    critic: "bg-purple-600",
    emotional: "bg-blue-500",
    blog: "bg-green-500",
    sns: "bg-amber-500",
  };
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {Object.entries(data).map(([style, count]) => (
        <div key={style} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full">
          <div className={cn("w-2 h-2 rounded-full", colors[style] ?? "bg-gray-500")} />
          <span className="text-xs text-gray-300">{STYLE_LABELS[style]}</span>
          <span className="text-xs text-gray-500">{Math.round((count / total) * 100)}%</span>
        </div>
      ))}
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

function MyReviewCard({
  review,
  onDelete,
}: {
  review: Review;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const timeAgo = getTimeAgo(review.created_at);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/review/" + review.id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: review.user_id ?? null }),
      });
      const data = await res.json();
      if (data.success) {
        onDelete(review.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all cursor-pointer"
      onClick={() => { if (!showDeleteConfirm) router.push(`/review/${review.id}`); }}
    >
      <div className="flex gap-0">
        <div className="w-14 flex-shrink-0 bg-gray-800">
          {review.movie_poster ? (
            <Image src={review.movie_poster} alt={review.movie_title} width={56} height={84} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full min-h-[84px] flex items-center justify-center">
              <Film className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold text-red-400">{review.movie_title}</span>
            {review.is_ai_assisted && (
              <span className="flex items-center gap-0.5 text-[9px] border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2 h-2" /> AI
              </span>
            )}
            {review.is_user_edited && (
              <span className="flex items-center gap-0.5 text-[9px] border border-amber-800 text-amber-400 px-1.5 py-0.5 rounded-full">
                <PenLine className="w-2 h-2" /> 검수
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/review/${review.id}`); }}
                className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                수정
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{review.content}</p>

          {showDeleteConfirm && (
            <div className="mt-2 p-2 bg-red-950/30 border border-red-900 rounded-lg" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-red-400 mb-2">정말 삭제하시겠습니까?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs border border-gray-700 text-gray-400 px-3 py-1 rounded transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {!showDeleteConfirm && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full">
                {STYLE_LABELS[review.style]}
              </span>
              <span className="text-[10px] text-gray-600">반영도 {review.match_score}%</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-600 ml-auto">
                <Clock className="w-2.5 h-2.5" />{timeAgo}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MypageClient({
  user,
  profile,
  reviews: initialReviews,
}: {
  user: User;
  profile: Profile | null;
  reviews: Review[];
}) {
  const [activeTab, setActiveTab] = useState<"reviews" | "analysis">("reviews");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const handleDeleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const genreData = analyzeGenreMap(reviews);
  const styleData = analyzeStyleMap(reviews);
  const avgMatchScore = reviews.length > 0
    ? Math.round(reviews.reduce((a, r) => a + r.match_score, 0) / reviews.length)
    : 0;

  const nickname = profile?.nickname ?? user.user_metadata?.name ?? "익명";
  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-5 p-5 bg-gray-900/60 border border-gray-800 rounded-2xl mb-6">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={nickname} width={64} height={64} className="rounded-full flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {nickname[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-white">{nickname}</h1>
            <Link href="/settings" className="ml-auto text-gray-500 hover:text-gray-300 transition-colors" title="계정 설정">
              <Settings className="w-4 h-4" />
            </Link>
            {profile?.is_trusted ? (
              <span className="flex items-center gap-1 text-[10px] border border-teal-700 text-teal-400 bg-teal-950/30 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5" /> 신뢰 마크
              </span>
            ) : (
              <span className="text-[10px] text-gray-600">
                신뢰 마크까지 {Math.max(0, 10 - reviews.length)}개 남음
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{user.email}</p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <div className="text-base font-bold text-white">{reviews.length}</div>
              <div className="text-[10px] text-gray-500">리뷰</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-base font-bold text-white">{avgMatchScore}%</div>
              <div className="text-[10px] text-gray-500">평균 반영도</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-base font-bold text-white">{genreData[0]?.[0] ?? "—"}</div>
              <div className="text-[10px] text-gray-500">최다 감정</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "reviews", label: "내 리뷰", icon: Film },
          { key: "analysis", label: "나의 영화 지도", icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "reviews" | "analysis")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === key ? "bg-white text-black" : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">아직 작성한 리뷰가 없습니다</p>
              <Link href="/review-lab">
                <button className="mt-4 text-xs text-red-500 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-950/30 transition-colors">
                  AI 비평실에서 첫 리뷰 작성하기
                </button>
              </Link>
            </div>
          ) : (
            reviews.map((review) => (
              <MyReviewCard
                key={review.id}
                review={review}
                onDelete={handleDeleteReview}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">리뷰가 쌓일수록 취향 지도가 완성됩니다</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-bold text-white">자주 쓴 감정 키워드</h2>
                </div>
                <GenreChart data={genreData} />
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <PenLine className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-bold text-white">선호 문체</h2>
                </div>
                <StyleDonut data={styleData} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">{reviews.length}</div>
                  <div className="text-xs text-gray-500 mt-1">총 리뷰</div>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-red-400">{avgMatchScore}%</div>
                  <div className="text-xs text-gray-500 mt-1">평균 반영도</div>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-purple-400">
                    {reviews.filter((r) => r.is_ai_assisted).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">AI 작성</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
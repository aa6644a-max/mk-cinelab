"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Film, ShieldCheck, Sparkles, PenLine, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const STYLE_LABELS: Record<string, string> = {
  critic: "평론가 모드",
  emotional: "감성 모드",
  blog: "블로그 모드",
  sns: "SNS 모드",
};

const BADGE_INFO = {
  trusted: {
    icon: ShieldCheck,
    label: "신뢰 마크",
    class: "border-teal-700 text-teal-400 bg-teal-950/30",
  },
  ai: {
    icon: Sparkles,
    label: "AI Assisted",
    class: "border-purple-700 text-purple-400 bg-purple-950/30",
  },
  edited: {
    icon: PenLine,
    label: "사용자 검수",
    class: "border-amber-700 text-amber-400 bg-amber-950/30",
  },
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

function ReviewCard({
  review,
  isAdmin,
  onDelete,
}: {
  review: any;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const profile = review.profiles;
  const timeAgo = getTimeAgo(review.created_at);
  const detailHref = "/review/" + review.id;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAdminDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/review/" + review.id, { method: "DELETE" });
      const data = await res.json();
      if (data.success) onDelete(review.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const cardContent = (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all">
      <div className="flex gap-0">
        <div className="w-24 flex-shrink-0 bg-gray-800 self-stretch">
          {review.movie_poster ? (
            <Image
              src={review.movie_poster}
              alt={review.movie_title}
              width={96}
              height={144}
              className="w-full h-full object-cover"
              style={{ minHeight: "120px" }}
            />
          ) : (
            <div className="w-full min-h-[120px] flex items-center justify-center">
              <Film className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.nickname} width={20} height={20} className="rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                {(profile?.nickname ?? review.guest_nickname ?? "?")[0]}
              </div>
            )}
            <span className="text-xs font-medium text-gray-300">
              {profile?.nickname ?? review.guest_nickname ?? "익명"}
            </span>
            {profile?.is_trusted && (
              <span className={cn("flex items-center gap-1 text-[10px] border px-1.5 py-0.5 rounded-full", BADGE_INFO.trusted.class)}>
                <ShieldCheck className="w-2.5 h-2.5" />{BADGE_INFO.trusted.label}
              </span>
            )}
            {review.is_ai_assisted && (
              <span className={cn("flex items-center gap-1 text-[10px] border px-1.5 py-0.5 rounded-full", BADGE_INFO.ai.class)}>
                <Sparkles className="w-2.5 h-2.5" />{BADGE_INFO.ai.label}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
              <Clock className="w-2.5 h-2.5" />{timeAgo}
            </span>
            {isAdmin && (
              <button
                onClick={(e) => { e.preventDefault(); setShowConfirm(true); }}
                className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <p className="text-xs text-red-500 font-semibold mb-1">{review.movie_title}</p>
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{review.content}</p>

          {showConfirm && (
            <div
              onClick={(e) => e.preventDefault()}
              className="mt-2 p-2 bg-red-950/30 border border-red-900 rounded-lg"
            >
              <p className="text-xs text-red-400 mb-2">이 리뷰를 삭제하시겠습니까?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); handleAdminDelete(); }}
                  disabled={isDeleting}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setShowConfirm(false); }}
                  className="text-xs border border-gray-700 text-gray-400 px-3 py-1 rounded transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
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
  );

  return <Link href={detailHref} className="block">{cardContent}</Link>;
}

export default function BoardClient({
  reviews: initialReviews,
  currentSort,
}: {
  reviews: any[];
  currentSort: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }: { data: { is_admin: boolean } | null }) => setIsAdmin(data?.is_admin ?? false));
  }, [user]);

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">리뷰 보드</h1>
          <p className="text-xs text-gray-500 mt-1">신뢰 마크 리뷰어의 글이 우선 노출됩니다</p>
        </div>
        <div className="flex gap-2">
          {[
            { val: "latest", label: "최신순" },
            { val: "trust", label: "반영도순" },
          ].map((s) => (
            <button
              key={s.val}
              onClick={() => router.push("/board?sort=" + s.val)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                currentSort === s.val
                  ? "bg-white text-black border-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
        {Object.values(BADGE_INFO).map((b) => {
          const Icon = b.icon;
          return (
            <span key={b.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={cn("flex items-center gap-1 border px-1.5 py-0.5 rounded-full text-[10px]", b.class)}>
                <Icon className="w-2.5 h-2.5" />
                {b.label}
              </span>
            </span>
          );
        })}
        <span className="text-xs text-gray-600 self-center ml-auto">배지 기준은 투명하게 공개됩니다</span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 작성된 리뷰가 없습니다</p>
          <p className="text-xs mt-1">AI 비평실에서 첫 리뷰를 작성해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
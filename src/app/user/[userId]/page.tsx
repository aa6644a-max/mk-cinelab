"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ArrowLeft, Film, ShieldCheck, Sparkles, PenLine,
  Clock, BarChart2
} from "lucide-react";
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

interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  is_trusted: boolean;
  bio: string | null;
  review_count: number;
}

interface Review {
  id: string;
  movie_title: string;
  movie_poster: string | null;
  content: string;
  style: string;
  match_score: number;
  is_ai_assisted: boolean;
  is_user_edited: boolean;
  created_at: string;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/user/${userId}/reviews`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data.profile);
        setReviews(data.reviews);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="h-28 bg-gray-900 rounded-2xl animate-pulse" />
        <div className="h-32 bg-gray-900 rounded-2xl animate-pulse" />
        <div className="h-32 bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm mb-4">사용자를 찾을 수 없습니다</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-red-500 hover:text-red-400 transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const avgMatchScore = reviews.length > 0
    ? Math.round(reviews.reduce((a, r) => a + r.match_score, 0) / reviews.length)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> 돌아가기
      </button>

      {/* 프로필 카드 */}
      <div className="flex items-start gap-5 p-5 bg-gray-900/60 border border-gray-800 rounded-2xl mb-6">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.nickname}
            width={64}
            height={64}
            className="rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {profile.nickname[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-lg font-bold text-white">{profile.nickname}</h1>
            {profile.is_trusted && (
              <span className="flex items-center gap-1 text-[10px] border border-teal-700 text-teal-400 bg-teal-950/30 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5" /> 신뢰 마크
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="text-sm text-gray-400 mb-3">{profile.bio}</p>
          )}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-base font-bold text-white">{reviews.length}</div>
              <div className="text-[10px] text-gray-500">리뷰</div>
            </div>
            {reviews.length > 0 && (
              <>
                <div className="w-px bg-gray-800" />
                <div className="text-center">
                  <div className="text-base font-bold text-white">{avgMatchScore}%</div>
                  <div className="text-[10px] text-gray-500">평균 반영도</div>
                </div>
                <div className="w-px bg-gray-800" />
                <div className="text-center">
                  <div className="text-base font-bold text-purple-400">
                    {reviews.filter((r) => r.is_ai_assisted).length}
                  </div>
                  <div className="text-[10px] text-gray-500">AI 작성</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="flex items-center gap-2 mb-4">
        <Film className="w-4 h-4 text-red-500" />
        <h2 className="text-sm font-bold text-white">작성한 리뷰</h2>
        <span className="text-xs text-gray-600 ml-1">{reviews.length}편</span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <BarChart2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 작성한 리뷰가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Link key={review.id} href={`/review/${review.id}`}>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all">
                <div className="flex gap-0">
                  <div className="w-14 flex-shrink-0 bg-gray-800">
                    {review.movie_poster ? (
                      <Image
                        src={review.movie_poster}
                        alt={review.movie_title}
                        width={56}
                        height={84}
                        className="w-full h-full object-cover"
                      />
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
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{review.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full">
                        {STYLE_LABELS[review.style]}
                      </span>
                      <span className="text-[10px] text-gray-600">반영도 {review.match_score}%</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-600 ml-auto">
                        <Clock className="w-2.5 h-2.5" />{getTimeAgo(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

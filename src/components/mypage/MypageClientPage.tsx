"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import MypageClient from "@/components/mypage/MypageClient";
import LoginButtonClient from "@/components/mypage/LoginButtonClient";
import Link from "next/link";

export default function MypageClientPage() {
  const { user, initialized } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      setDataLoaded(true);
      return;
    }

    setDataLoading(true);
    Promise.all([
      supabase
        .from("reviews")
        .select("id, movie_title, movie_poster, content, style, input_keywords, match_score, is_ai_assisted, is_user_edited, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("nickname, avatar_url, is_trusted, review_count")
        .eq("id", user.id)
        .single(),
    ]).then(([reviewsRes, profileRes]) => {
      setReviews(reviewsRes.data ?? []);
      setProfile(profileRes.data);
    }).catch((err) => {
      console.error("마이페이지 데이터 로딩 오류:", err);
    }).finally(() => {
      setDataLoading(false);
      setDataLoaded(true);
    });
  }, [user, initialized]);

  // 초기화 전 또는 데이터 로딩 중
  if (!initialized || (user && !dataLoaded)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-32 bg-gray-900 rounded-2xl animate-pulse" />
          <div className="h-48 bg-gray-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // 비로그인
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-4xl mb-6">🎬</div>
        <h1 className="text-xl font-bold text-white mb-3">로그인이 필요합니다</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          마이페이지에서 내가 작성한 리뷰와<br />
          나만의 영화 취향 지도를 확인할 수 있습니다
        </p>
        <div className="space-y-3">
          <LoginButtonClient />
          <Link href="/">
            <button className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
              메인으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MypageClient
      user={user}
      profile={profile}
      reviews={reviews}
    />
  );
}
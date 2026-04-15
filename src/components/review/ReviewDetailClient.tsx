"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, ShieldCheck, Sparkles, PenLine, Clock,
  Film, Calendar, Timer, Tag, Pencil, Trash2, Check, X,
} from "lucide-react";

const ADMIN_EMAIL = "aa6644a@gmail.com";

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

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

function formatReleaseDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

interface MovieDetail {
  release_date?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export default function ReviewDetailClient({
  review,
  movieDetail,
}: {
  review: any;
  movieDetail: MovieDetail | null;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const profile = review.profiles;
  const detailHref = review.tmdb_id ? "/movie/tmdb-" + review.tmdb_id : null;

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isOwner = !!user && !!profile?.id && user.id === profile.id;
  const canEdit = isOwner || isAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentContent, setCurrentContent] = useState(review.content);
  const [isUserEdited, setIsUserEdited] = useState(review.is_user_edited);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/review/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          userId: user?.id ?? null,
          isAdmin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentContent(editContent.trim());
        setIsUserEdited(true);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/review/${review.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? null,
          isAdmin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/board");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/board"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> 리뷰 보드로
      </Link>

      {/* 영화 정보 헤더 */}
      <div className="flex gap-4 p-5 bg-gray-900/60 border border-gray-800 rounded-2xl mb-6">
        {review.movie_poster ? (
          <Image
            src={review.movie_poster}
            alt={review.movie_title}
            width={80}
            height={120}
            className="rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-[120px] bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Film className="w-6 h-6 text-gray-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-red-500 font-semibold tracking-widest mb-1 uppercase">영화</p>
          <h1 className="text-xl font-black text-white mb-3">{review.movie_title}</h1>
          <div className="space-y-1.5 mb-3">
            {movieDetail?.release_date && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3 h-3 text-gray-600 flex-shrink-0" />
                {formatReleaseDate(movieDetail.release_date)}
              </div>
            )}
            {movieDetail?.runtime && movieDetail.runtime > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Timer className="w-3 h-3 text-gray-600 flex-shrink-0" />
                {formatRuntime(movieDetail.runtime)}
              </div>
            )}
            {movieDetail?.genres && movieDetail.genres.length > 0 && (
              <div className="flex items-start gap-1.5 text-xs text-gray-400">
                <Tag className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                <span className="flex flex-wrap gap-1">
                  {movieDetail.genres.map((g) => (
                    <span key={g.id} className="border border-gray-700 px-1.5 py-0.5 rounded-full text-[10px] text-gray-400">
                      {g.name}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
          {detailHref && (
            <Link href={detailHref}>
              <button className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 hover:text-white transition-colors">
                영화 상세 보기 →
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 작성자 정보 + 수정/삭제 버튼 */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.nickname} width={36} height={36} className="rounded-full" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
              {(profile?.nickname ?? "?")[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white">
                {profile?.nickname ?? review.guest_nickname ?? "익명"}
              </span>
              {profile?.is_trusted && (
                <span className="flex items-center gap-0.5 text-[9px] border border-teal-800 text-teal-400 px-1.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-2 h-2" /> 신뢰 마크
                </span>
              )}
              {review.is_ai_assisted && (
                <span className="flex items-center gap-0.5 text-[9px] border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="w-2 h-2" /> AI Assisted
                </span>
              )}
              {isUserEdited && (
                <span className="flex items-center gap-0.5 text-[9px] border border-amber-800 text-amber-400 px-1.5 py-0.5 rounded-full">
                  <PenLine className="w-2 h-2" /> 사용자 검수
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              {getTimeAgo(review.created_at)}
              <span className="mx-1">·</span>
              {STYLE_LABELS[review.style] ?? review.style}
              {isAdmin && !isOwner && (
                <span className="ml-1 text-red-500">(관리자 권한)</span>
              )}
            </div>
          </div>
        </div>

        {/* 수정/삭제 버튼 — 본인 또는 관리자만 표시 */}
        {canEdit && !isEditing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { setEditContent(currentContent); setIsEditing(true); }}
              className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
            >
              <Pencil className="w-3 h-3" /> 수정
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-800 px-3 py-1.5 rounded-lg hover:border-red-700 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> 삭제
            </button>
          </div>
        )}
      </div>

      {/* 삭제 확인 */}
      {showDeleteConfirm && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-900 rounded-xl">
          <p className="text-sm text-red-400 mb-3">정말 이 리뷰를 삭제하시겠습니까?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-sm border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 감상 반영도 */}
      <div className="space-y-1.5 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">감상 반영도</span>
          <span className="text-xs font-bold text-red-400">{review.match_score}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full"
            style={{ width: review.match_score + "%" }}
          />
        </div>
      </div>

      {/* 입력 키워드 */}
      {review.input_keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          <span className="text-xs text-gray-600 self-center">감정 키워드:</span>
          {review.input_keywords.map((kw: string) => (
            <span key={kw} className="text-xs border border-red-900 text-red-400 px-2 py-0.5 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* 리뷰 본문 / 수정 에디터 */}
      {isEditing ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">리뷰 수정</span>
            <span className="text-xs text-gray-600">{editContent.length}자</span>
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={8}
            className="w-full bg-gray-900 border border-red-700 rounded-2xl px-5 py-4 text-gray-200 text-sm leading-relaxed focus:outline-none focus:border-red-500 resize-none transition-colors"
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !editContent.trim()}
              className="flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditContent(currentContent); }}
              className="flex items-center gap-1.5 text-sm border border-gray-700 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" /> 취소
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6 mb-6">
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {currentContent}
          </p>
        </div>
      )}

      {/* 원본 감상 */}
      {review.user_input && (
        <div className="border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-2">작성자의 원본 감상</p>
          <p className="text-xs text-gray-500 leading-relaxed italic">
            "{review.user_input}"
          </p>
        </div>
      )}
    </div>
  );
}

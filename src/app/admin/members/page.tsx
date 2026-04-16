"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, ShieldCheck, Film, ArrowLeft, Trash2,
  ChevronRight, X, Check, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ADMIN_EMAIL = "aa6644a@gmail.com";

const GENDER_LABELS: Record<string, string> = { male: "남성", female: "여성" };
const STYLE_LABELS: Record<string, string> = {
  critic: "평론가", emotional: "감성", blog: "블로그", sns: "SNS",
};

interface Member {
  id: string;
  email: string;
  nickname: string;
  birth_date: string | null;
  gender: string | null;
  review_count: number;
  is_trusted: boolean;
  joined_at: string;
}

interface Review {
  id: string;
  movie_title: string;
  movie_poster: string | null;
  content: string;
  style: string;
  match_score: number;
  created_at: string;
  user_id: string;
  profiles: { nickname: string } | null;
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age + "세";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = Math.floor(diff / 86400000);
  if (day > 0) return day + "일 전";
  const hour = Math.floor(diff / 3600000);
  if (hour > 0) return hour + "시간 전";
  const min = Math.floor(diff / 60000);
  if (min > 0) return min + "분 전";
  return "방금 전";
}

// ─── 회원 상세 모달 ──────────────────────────────────────────────
function MemberDetailModal({
  member,
  onClose,
  onDeleteReview,
}: {
  member: Member;
  onClose: () => void;
  onDeleteReview: (reviewId: string) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/user/${member.id}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .finally(() => setLoading(false));
  }, [member.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{member.nickname}</span>
              {member.is_trusted && <ShieldCheck className="w-4 h-4 text-teal-400" />}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 회원 정보 */}
        <div className="flex gap-4 px-5 py-3 border-b border-gray-800 text-xs text-gray-400">
          <span>성별: {member.gender ? GENDER_LABELS[member.gender] : "미기재"}</span>
          <span>나이: {calcAge(member.birth_date)}</span>
          <span>가입일: {formatDate(member.joined_at)}</span>
          <span>리뷰: {member.review_count}편</span>
        </div>

        {/* 리뷰 목록 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-10">작성한 리뷰가 없습니다</p>
          ) : (
            <div className="p-3 space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-3 p-3 bg-gray-800/50 rounded-xl">
                  {review.movie_poster ? (
                    <Image
                      src={review.movie_poster}
                      alt={review.movie_title}
                      width={36}
                      height={54}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-[54px] bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Film className="w-3 h-3 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-white">{review.movie_title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {STYLE_LABELS[review.style] ?? review.style} · {getTimeAgo(review.created_at)} · {review.match_score}%
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="flex-shrink-0 text-gray-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                      {review.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 탈퇴 확인 모달 ──────────────────────────────────────────────
function DeleteConfirmModal({
  member,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  member: Member;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-gray-900 border border-red-900 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-bold">회원 강제 탈퇴</h3>
        </div>
        <p className="text-sm text-gray-300 mb-1">
          <span className="text-white font-medium">{member.nickname}</span> 회원을 탈퇴시킵니다.
        </p>
        <p className="text-xs text-gray-500 mb-5">
          해당 회원의 모든 리뷰와 계정 정보가 삭제되며 복구할 수 없습니다.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? "처리 중..." : "탈퇴 처리"}
          </button>
          <button
            onClick={onCancel}
            className="text-sm border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────
export default function AdminMembersPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();

  const [tab, setTab] = useState<"members" | "reviews">("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const PAGE_SIZE = 20;

  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trustLoading, setTrustLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!user || user.email !== ADMIN_EMAIL) { router.replace("/"); return; }
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((d) => { if (d.error) { setError(d.error); return; } setMembers(d.members); })
      .catch(() => setError("데이터를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [user, initialized, router]);

  const loadReviews = useCallback((page: number) => {
    setReviewsLoading(true);
    fetch(`/api/admin/reviews?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setReviews(d.reviews ?? []);
          setReviewTotal(d.total ?? 0);
          setReviewPage(d.page ?? 1);
        }
      })
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "reviews") loadReviews(reviewPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // 신뢰 마크 토글
  const handleTrustToggle = async (member: Member) => {
    setTrustLoading(member.id);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_trusted: !member.is_trusted }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => m.id === member.id ? { ...m, is_trusted: !m.is_trusted } : m)
        );
      }
    } finally {
      setTrustLoading(null);
    }
  };

  // 회원 강제 탈퇴
  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/members/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        setReviews((prev) => prev.filter((r) => r.user_id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 리뷰 삭제 (관리자)
  const handleDeleteReview = async (reviewId: string, ownerId?: string) => {
    const res = await fetch(`/api/review/${reviewId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: true }),
    });
    const data = await res.json();
    if (data.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setReviewTotal((prev) => Math.max(0, prev - 1));
      // 회원 리뷰 카운트 갱신
      const targetId = ownerId ?? detailMember?.id;
      if (targetId) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === targetId ? { ...m, review_count: Math.max(0, m.review_count - 1) } : m
          )
        );
      }
    }
  };

  if (!initialized || (user?.email === ADMIN_EMAIL && loading)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-3">
        <div className="h-10 bg-gray-900 rounded-xl animate-pulse w-48" />
        <div className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    );
  }
  if (!user || user.email !== ADMIN_EMAIL) return null;

  const totalMale = members.filter((m) => m.gender === "male").length;
  const totalFemale = members.filter((m) => m.gender === "female").length;
  const noGender = members.filter((m) => !m.gender).length;

  const ageGroups: Record<string, number> = {};
  members.forEach((m) => {
    if (!m.birth_date) { ageGroups["미기재"] = (ageGroups["미기재"] ?? 0) + 1; return; }
    const age = new Date().getFullYear() - new Date(m.birth_date).getFullYear();
    const group = Math.floor(age / 10) * 10;
    const label = group >= 60 ? "60대 이상" : `${group}대`;
    ageGroups[label] = (ageGroups[label] ?? 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-white">관리자 패널</h1>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg mb-4">{error}</p>
      )}

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("members")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "members" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1.5" />
          회원 관리
          <span className="ml-1.5 text-xs text-gray-400">{members.length}</span>
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "reviews" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Film className="w-3.5 h-3.5 inline mr-1.5" />
          리뷰 관리
          {reviewTotal > 0 && (
            <span className="ml-1.5 text-xs text-gray-400">{reviewTotal}</span>
          )}
        </button>
      </div>

      {/* ── 회원 관리 탭 ── */}
      {tab === "members" && (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="전체 회원" value={members.length + "명"} icon={<Users className="w-4 h-4" />} />
            <StatCard
              label="성별 분포"
              value={`남 ${totalMale} / 여 ${totalFemale}${noGender > 0 ? ` / 미기재 ${noGender}` : ""}`}
              small
            />
            <StatCard
              label="연령 분포"
              value={Object.entries(ageGroups).sort().map(([k, v]) => `${k} ${v}명`).join(" · ")}
              small
            />
            <StatCard
              label="신뢰 마크"
              value={members.filter((m) => m.is_trusted).length + "명"}
              icon={<ShieldCheck className="w-4 h-4 text-teal-400" />}
            />
          </div>

          {/* 회원 목록 — 모바일: 카드 / 데스크탑: 테이블 */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">

            {/* 모바일 카드 (md 미만) */}
            <div className="md:hidden divide-y divide-gray-800">
              {members.length === 0 ? (
                <p className="px-4 py-12 text-center text-gray-600 text-sm">가입된 회원이 없습니다</p>
              ) : members.map((member) => (
                <div key={member.id} className="p-4 space-y-3">
                  {/* 상단: 닉네임 + 배지 + 액션 */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-white">{member.nickname}</span>
                        {member.is_trusted && <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />}
                        {member.gender && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            member.gender === "male" ? "border-blue-800 text-blue-400" : "border-pink-800 text-pink-400"
                          }`}>
                            {GENDER_LABELS[member.gender]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                    </div>
                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleTrustToggle(member)}
                        disabled={trustLoading === member.id}
                        className={`p-2 rounded-lg transition-colors ${
                          member.is_trusted
                            ? "bg-teal-900/50 text-teal-400"
                            : "bg-gray-800 text-gray-600 hover:text-teal-400 hover:bg-teal-900/30"
                        } disabled:opacity-50`}
                        title={member.is_trusted ? "신뢰 마크 해제" : "신뢰 마크 부여"}
                      >
                        {member.is_trusted ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDetailMember(member)}
                        className="flex items-center gap-1 text-xs text-gray-400 border border-gray-700 px-3 py-2 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                      >
                        상세 <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(member)}
                        className="p-2 rounded-lg text-gray-600 border border-gray-800 hover:border-red-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* 하단: 메타 정보 */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{calcAge(member.birth_date)}</span>
                    <span>·</span>
                    <span>리뷰 {member.review_count}개</span>
                    <span>·</span>
                    <span>가입 {formatDate(member.joined_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 데스크탑 테이블 (md 이상) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">닉네임</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">이메일</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">성별</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">나이</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium text-center">리뷰</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">가입일</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium text-center">신뢰</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <tr
                      key={member.id}
                      className={`border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition-colors ${
                        i % 2 !== 0 ? "bg-gray-900/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium">{member.nickname}</span>
                          {member.is_trusted && <ShieldCheck className="w-3 h-3 text-teal-400" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{member.email}</td>
                      <td className="px-4 py-3">
                        {member.gender ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            member.gender === "male" ? "border-blue-800 text-blue-400" : "border-pink-800 text-pink-400"
                          }`}>
                            {GENDER_LABELS[member.gender]}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">미기재</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{calcAge(member.birth_date)}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm text-center">{member.review_count}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(member.joined_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTrustToggle(member)}
                          disabled={trustLoading === member.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            member.is_trusted
                              ? "bg-teal-900/50 text-teal-400 hover:bg-teal-900"
                              : "bg-gray-800 text-gray-600 hover:text-teal-400 hover:bg-teal-900/30"
                          } disabled:opacity-50`}
                          title={member.is_trusted ? "신뢰 마크 해제" : "신뢰 마크 부여"}
                        >
                          {member.is_trusted ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailMember(member)}
                            className="flex items-center gap-1 text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                          >
                            상세 <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="p-1.5 rounded-lg text-gray-600 border border-gray-800 hover:border-red-700 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-600 text-sm">가입된 회원이 없습니다</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 리뷰 관리 탭 ── */}
      {tab === "reviews" && (
        <div>
          {/* 페이지 정보 + 이동 버튼 */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              전체 {reviewTotal}개 · {reviewPage}페이지 / {Math.max(1, Math.ceil(reviewTotal / PAGE_SIZE))}페이지
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = reviewPage - 1; setReviewPage(p); loadReviews(p); }}
                disabled={reviewPage <= 1 || reviewsLoading}
                className="px-4 py-2.5 text-xs border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← 이전
              </button>
              <button
                onClick={() => { const p = reviewPage + 1; setReviewPage(p); loadReviews(p); }}
                disabled={reviewPage >= Math.ceil(reviewTotal / PAGE_SIZE) || reviewsLoading}
                className="px-4 py-2.5 text-xs border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                다음 →
              </button>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
            {reviewsLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-12">리뷰가 없습니다</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 px-4 py-3 hover:bg-gray-800/20 transition-colors">
                    {review.movie_poster ? (
                      <Image
                        src={review.movie_poster}
                        alt={review.movie_title}
                        width={36}
                        height={54}
                        className="rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-[54px] bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Film className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">{review.movie_title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {review.profiles?.nickname ?? "탈퇴 회원"} ·{" "}
                            {STYLE_LABELS[review.style] ?? review.style} ·{" "}
                            {getTimeAgo(review.created_at)} · {review.match_score}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href={`/review/${review.id}`}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            보기
                          </Link>
                          <button
                            onClick={() => handleDeleteReview(review.id, review.user_id)}
                            className="text-gray-600 hover:text-red-400 transition-colors p-1"
                            title="리뷰 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 회원 상세 모달 */}
      {detailMember && (
        <MemberDetailModal
          member={detailMember}
          onClose={() => setDetailMember(null)}
          onDeleteReview={handleDeleteReview}
        />
      )}

      {/* 탈퇴 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          member={deleteTarget}
          onConfirm={handleDeleteMember}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

function StatCard({
  label, value, icon, small,
}: {
  label: string; value: string; icon?: React.ReactNode; small?: boolean;
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
      <p className={`font-bold text-white leading-snug ${small ? "text-xs" : "text-xl"}`}>{value}</p>
    </div>
  );
}

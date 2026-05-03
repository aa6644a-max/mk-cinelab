"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Trash2, Send } from "lucide-react";

const ADMIN_EMAIL = "aa6644a@gmail.com";

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { nickname: string; avatar_url?: string } | null;
}

export default function ReviewComments({ reviewId }: { reviewId: string }) {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/review/${reviewId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reviewId]);

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/review/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim(), userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다");
        return;
      }
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setText("");
      }
    } catch {
      setError("오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isAdmin }),
      });
      const data = await res.json();
      if (data.success) setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-800 pt-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-400">댓글</span>
        {!loading && (
          <span className="text-xs text-gray-600">{comments.length}</span>
        )}
      </div>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-xs text-gray-600 py-4 text-center">불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-gray-600 py-6 text-center">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </div>
      ) : (
        <div className="space-y-5 mb-6">
          {comments.map((comment) => {
            const isOwn = !!user && user.id === comment.user_id;
            const canDelete = isOwn || isAdmin;
            return (
              <div key={comment.id} className="flex gap-3 group">
                <div className="flex-shrink-0 mt-0.5">
                  {comment.profiles?.avatar_url ? (
                    <Image
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.nickname}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                      {(comment.profiles?.nickname ?? "?")[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-300">
                      {comment.profiles?.nickname ?? "탈퇴한 사용자"}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 self-start mt-0.5 text-gray-600 hover:text-red-400 transition-all disabled:opacity-30"
                    title="댓글 삭제"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 댓글 입력 */}
      {user ? (
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 uppercase">
              {(user.email ?? "?")[0]}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 300))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
              placeholder="댓글을 남겨보세요... (Ctrl+Enter로 등록)"
              rows={2}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none transition-colors"
            />
            {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-600">{text.length}/300</span>
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
                {submitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-600 text-center py-3 border border-gray-800 rounded-xl">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            로그인
          </Link>
          {" "}후 댓글을 작성할 수 있습니다.
        </div>
      )}
    </div>
  );
}

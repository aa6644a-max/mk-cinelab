"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Film, List, Plus, Trash2, Loader2, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import LoginButtonClient from "@/components/mypage/LoginButtonClient";

interface MovieList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

function getRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = Math.floor(diff / 86400000);
  if (day === 0) return "오늘";
  if (day === 1) return "어제";
  if (day < 30) return `${day}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function ListCard({
  list,
  onDelete,
}: {
  list: MovieList;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    try {
      await fetch(`/api/lists/${list.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      onDelete(list.id);
    } catch (err) {
      console.error("[ListCard] 삭제 실패:", err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
      <Link href={`/lists/${list.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {list.is_public ? (
              <Globe className="w-3 h-3 text-gray-500 flex-shrink-0" />
            ) : (
              <Lock className="w-3 h-3 text-gray-600 flex-shrink-0" />
            )}
            <h3 className="text-sm font-bold text-white truncate">{list.name}</h3>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">{list.item_count}편</span>
        </div>
        {list.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{list.description}</p>
        )}
        <p className="text-[10px] text-gray-600">{getRelativeDate(list.updated_at)} 수정</p>
      </Link>

      <div className="px-4 pb-3 flex items-center justify-end gap-2">
        {confirmDelete ? (
          <>
            <span className="text-xs text-red-400 flex-1">삭제하시겠습니까?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded transition-colors disabled:opacity-50"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs border border-gray-700 text-gray-400 px-2.5 py-1 rounded transition-colors"
            >
              취소
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> 삭제
          </button>
        )}
      </div>
    </div>
  );
}

export default function ListsClientPage() {
  const { user, initialized } = useAuth();
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchLists = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lists?userId=${user.id}`);
      const data = await res.json();
      setLists(data.lists ?? []);
    } catch (err) {
      console.error("[ListsClientPage] 조회 실패:", err);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { setLoaded(true); return; }
    fetchLists();
  }, [user, initialized, fetchLists]);

  async function createList() {
    if (!user || !newName.trim()) {
      setCreateError("리스트 이름을 입력해주세요");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: newName.trim(), description: newDesc.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? "오류가 발생했습니다"); return; }
      setLists((prev) => [{ ...data.list }, ...prev]);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (err) {
      console.error("[ListsClientPage] 생성 실패:", err);
      setCreateError("오류가 발생했습니다");
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteList(id: string) {
    setLists((prev) => prev.filter((l) => l.id !== id));
  }

  if (!initialized || (user && !loaded)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <List className="w-12 h-12 mx-auto mb-5 text-gray-700" />
        <h1 className="text-xl font-bold text-white mb-3">로그인이 필요합니다</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          나만의 영화 리스트를 만들고<br />
          보고 싶은 영화를 모아보세요
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <List className="w-5 h-5 text-red-500" />
            내 리스트
          </h1>
          <p className="text-xs text-gray-500 mt-1">{lists.length}개의 리스트</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setCreateError(""); }}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            showCreate
              ? "bg-gray-800 text-gray-300"
              : "bg-red-600 hover:bg-red-500 text-white"
          )}
        >
          <Plus className="w-4 h-4" />
          새 리스트
        </button>
      </div>

      {/* 리스트 생성 폼 */}
      {showCreate && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">리스트 이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") createList(); }}
              placeholder="예: 올해 꼭 봐야 할 영화"
              maxLength={50}
              autoFocus
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">설명 (선택)</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="리스트를 간단히 설명해주세요"
              maxLength={200}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
          {createError && <p className="text-xs text-red-400">{createError}</p>}
          <div className="flex gap-2">
            <button
              onClick={createList}
              disabled={creating}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {creating ? "생성 중..." : "리스트 만들기"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); setCreateError(""); }}
              className="px-4 py-2.5 border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 리스트 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
          <Film className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500 mb-2">아직 만든 리스트가 없습니다</p>
          <p className="text-xs text-gray-600">영화 상세 페이지에서 "리스트에 추가" 버튼을 눌러보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} onDelete={handleDeleteList} />
          ))}
        </div>
      )}
    </div>
  );
}

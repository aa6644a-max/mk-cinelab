"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Plus, Check, List, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MovieInfo {
  tmdbId: number;
  title: string;
  poster?: string | null;
}

interface ListItem {
  id: string;
  name: string;
  item_count: number;
  contains_movie: boolean;
}

interface Props {
  movie: MovieInfo;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToListModal({ movie, isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

  const fetchLists = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lists?userId=${user.id}&tmdbId=${movie.tmdbId}`);
      const data = await res.json();
      setLists(data.lists ?? []);
    } catch (err) {
      console.error("[AddToListModal] 리스트 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [user, movie.tmdbId]);

  useEffect(() => {
    if (isOpen && user) {
      fetchLists();
      setShowCreate(false);
      setNewName("");
      setCreateError("");
    }
  }, [isOpen, user, fetchLists]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  async function toggleMovie(list: ListItem) {
    if (!user || toggling) return;
    setToggling(list.id);
    try {
      if (list.contains_movie) {
        await fetch(`/api/lists/${list.id}/items/${movie.tmdbId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        setLists((prev) =>
          prev.map((l) => l.id === list.id ? { ...l, contains_movie: false, item_count: l.item_count - 1 } : l)
        );
      } else {
        const res = await fetch(`/api/lists/${list.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            tmdbId: movie.tmdbId,
            movieTitle: movie.title,
            moviePoster: movie.poster ?? null,
          }),
        });
        if (res.ok) {
          setLists((prev) =>
            prev.map((l) => l.id === list.id ? { ...l, contains_movie: true, item_count: l.item_count + 1 } : l)
          );
        }
      }
    } catch (err) {
      console.error("[AddToListModal] 토글 실패:", err);
    } finally {
      setToggling(null);
    }
  }

  async function createAndAdd() {
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
        body: JSON.stringify({ userId: user.id, name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "리스트 생성에 실패했습니다");
        return;
      }

      const newList = data.list;
      const addRes = await fetch(`/api/lists/${newList.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          tmdbId: movie.tmdbId,
          movieTitle: movie.title,
          moviePoster: movie.poster ?? null,
        }),
      });

      if (addRes.ok) {
        setLists((prev) => [
          { ...newList, contains_movie: true, item_count: 1 },
          ...prev,
        ]);
        setShowCreate(false);
        setNewName("");
      }
    } catch (err) {
      console.error("[AddToListModal] 생성 실패:", err);
      setCreateError("오류가 발생했습니다");
    } finally {
      setCreating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-white">리스트에 추가</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 영화 정보 */}
        <div className="px-5 py-3 border-b border-gray-800/60 bg-gray-900/40">
          <p className="text-xs text-gray-500 truncate">
            <span className="text-gray-300 font-medium">{movie.title}</span>
            을(를) 리스트에 추가합니다
          </p>
        </div>

        {/* 본문 */}
        <div className="max-h-72 overflow-y-auto">
          {!user ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400 mb-4">로그인 후 이용할 수 있습니다</p>
              <Link href="/login">
                <button onClick={onClose} className="text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors">
                  로그인
                </button>
              </Link>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          ) : lists.length === 0 && !showCreate ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500 mb-4">아직 만든 리스트가 없습니다</p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-xs text-red-500 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-950/30 transition-colors"
              >
                첫 리스트 만들기
              </button>
            </div>
          ) : (
            <ul className="py-1">
              {lists.map((list) => (
                <li key={list.id}>
                  <button
                    onClick={() => toggleMovie(list)}
                    disabled={toggling === list.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-800/50 transition-colors",
                      toggling === list.id && "opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors",
                      list.contains_movie
                        ? "bg-red-600 border-red-600"
                        : "border-gray-600"
                    )}>
                      {toggling === list.id ? (
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                      ) : list.contains_movie ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{list.name}</p>
                      <p className="text-xs text-gray-500">{list.item_count}편</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 새 리스트 만들기 */}
        {user && (
          <div className="border-t border-gray-800 px-5 py-4">
            {showCreate ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") createAndAdd(); }}
                  placeholder="리스트 이름 (최대 50자)"
                  maxLength={50}
                  autoFocus
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                />
                {createError && <p className="text-xs text-red-400">{createError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={createAndAdd}
                    disabled={creating}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {creating ? "생성 중..." : "만들고 추가"}
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setNewName(""); setCreateError(""); }}
                    className="px-3 py-2 border border-gray-700 text-gray-400 text-xs rounded-lg hover:border-gray-500 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-700 text-gray-500 text-xs rounded-xl hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                새 리스트 만들기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

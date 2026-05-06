"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Film, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListItem {
  id: string;
  tmdb_id: number;
  movie_title: string;
  movie_poster: string | null;
  added_at: string;
}

interface MovieList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
}

interface Props {
  listId: string;
}

export default function ListDetailClientPage({ listId }: Props) {
  const { user, initialized } = useAuth();
  const [list, setList] = useState<MovieList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const isOwner = user?.id === list?.user_id;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const userId = user?.id ?? "";
      const res = await fetch(`/api/lists/${listId}?userId=${userId}`);
      if (res.status === 404 || res.status === 403) { setNotFound(true); return; }
      const data = await res.json();
      setList(data.list);
      setItems(data.items ?? []);
      setNameInput(data.list.name);
    } catch (err) {
      console.error("[ListDetailClientPage] 조회 실패:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [listId, user?.id]);

  useEffect(() => {
    if (!initialized) return;
    fetchList();
  }, [initialized, fetchList]);

  async function saveName() {
    if (!user || !list || !nameInput.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: nameInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setList((prev) => prev ? { ...prev, name: data.list.name } : prev);
        setEditingName(false);
      }
    } catch (err) {
      console.error("[ListDetailClientPage] 이름 수정 실패:", err);
    } finally {
      setSavingName(false);
    }
  }

  async function removeMovie(tmdbId: number) {
    if (!user || !list) return;
    setRemovingId(tmdbId);
    try {
      await fetch(`/api/lists/${list.id}/items/${tmdbId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      setItems((prev) => prev.filter((item) => item.tmdb_id !== tmdbId));
    } catch (err) {
      console.error("[ListDetailClientPage] 삭제 실패:", err);
    } finally {
      setRemovingId(null);
    }
  }

  if (!initialized || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-900 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[2/3] bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !list) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 mb-4">리스트를 찾을 수 없습니다</p>
        <Link href="/lists">
          <button className="text-sm text-red-500 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-950/30 transition-colors">
            내 리스트로
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/lists" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> 내 리스트로
      </Link>

      {/* 리스트 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setNameInput(list.name); } }}
                maxLength={50}
                autoFocus
                className="flex-1 bg-gray-900 border border-red-600 rounded-lg px-3 py-1.5 text-lg font-black text-white focus:outline-none"
              />
              <button
                onClick={saveName}
                disabled={savingName}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setEditingName(false); setNameInput(list.name); }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-white">{list.name}</h1>
              {isOwner && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-600 hover:text-gray-300 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
        {list.description && (
          <p className="text-sm text-gray-500">{list.description}</p>
        )}
        <p className="text-xs text-gray-600 mt-1">{items.length}편</p>
      </div>

      {/* 영화 목록 */}
      {items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
          <Film className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500 mb-2">아직 담은 영화가 없습니다</p>
          <Link href="/">
            <button className="text-xs text-red-500 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-950/30 transition-colors mt-2">
              영화 찾아보기
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/movie/tmdb-${item.tmdb_id}`} className="block">
                <div className="aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden mb-2 relative">
                  {item.movie_poster ? (
                    <Image
                      src={item.movie_poster}
                      alt={item.movie_title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl" />
                </div>
                <p className="text-xs text-gray-300 font-medium line-clamp-2 group-hover:text-white transition-colors">
                  {item.movie_title}
                </p>
              </Link>
              {isOwner && (
                <button
                  onClick={() => removeMovie(item.tmdb_id)}
                  disabled={removingId === item.tmdb_id}
                  className={cn(
                    "absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all",
                    "opacity-0 group-hover:opacity-100"
                  )}
                  title="리스트에서 제거"
                >
                  {removingId === item.tmdb_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

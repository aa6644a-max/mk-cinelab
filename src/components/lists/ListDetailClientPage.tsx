"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Film, Loader2, Pencil, X, Check, Search, Plus } from "lucide-react";
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

interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = user?.id === list?.user_id;
  const addedTmdbIds = new Set(items.map((i) => i.tmdb_id));

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
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [listId, user?.id]);

  useEffect(() => {
    if (!initialized) return;
    fetchList();
  }, [initialized, fetchList]);

  // 검색 디바운스
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data.results ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // 검색창 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    } finally {
      setRemovingId(null);
    }
  }

  async function addMovie(movie: SearchResult) {
    if (!user || !list || addingId) return;
    setAddingId(movie.id);
    try {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
      const res = await fetch(`/api/lists/${list.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          tmdbId: movie.id,
          movieTitle: movie.title,
          moviePoster: poster,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [data.item, ...prev]);
      }
    } finally {
      setAddingId(null);
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") { setEditingName(false); setNameInput(list.name); }
                }}
                maxLength={50}
                autoFocus
                className="flex-1 bg-gray-900 border border-red-600 rounded-lg px-3 py-1.5 text-lg font-black text-white focus:outline-none"
              />
              <button onClick={saveName} disabled={savingName} className="text-green-400 hover:text-green-300 transition-colors">
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(list.name); }} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-white">{list.name}</h1>
              {isOwner && (
                <button onClick={() => setEditingName(true)} className="text-gray-600 hover:text-gray-300 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
        {list.description && <p className="text-sm text-gray-500">{list.description}</p>}
        <p className="text-xs text-gray-600 mt-1">{items.length}편</p>
      </div>

      {/* 영화 검색 (소유자만) */}
      {isOwner && (
        <div ref={searchRef} className="relative mb-8">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-red-600 transition-colors">
            {searching ? (
              <Loader2 className="w-4 h-4 text-gray-500 flex-shrink-0 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="영화 제목으로 검색해서 추가..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="text-gray-600 hover:text-gray-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 검색 결과 드롭다운 */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-30">
              {searchResults.map((movie) => {
                const already = addedTmdbIds.has(movie.id);
                return (
                  <div key={movie.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition-colors">
                    <div className="w-8 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          width={32}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{movie.title}</p>
                      <p className="text-xs text-gray-500">{movie.release_date?.slice(0, 4) ?? "—"}</p>
                    </div>
                    <button
                      onClick={() => !already && addMovie(movie)}
                      disabled={already || addingId === movie.id}
                      className={cn(
                        "flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0",
                        already
                          ? "text-gray-600 border border-gray-800 cursor-default"
                          : addingId === movie.id
                          ? "text-gray-500 border border-gray-700 cursor-wait"
                          : "text-white bg-red-600 hover:bg-red-500"
                      )}
                    >
                      {already ? (
                        <><Check className="w-3 h-3" /> 추가됨</>
                      ) : addingId === movie.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><Plus className="w-3 h-3" /> 추가</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 영화 그리드 */}
      {items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
          <Film className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500 mb-1">아직 담은 영화가 없습니다</p>
          <p className="text-xs text-gray-600">위 검색창에서 영화를 찾아 추가해보세요</p>
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
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 디바운스 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(query));
        const data = await res.json();
        setResults(data.results ?? []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (movie: SearchResult) => {
    setQuery("");
    setIsOpen(false);
    setResults([]);
    router.push("/movie/tmdb-" + movie.id);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative" style={{ isolation: "isolate" }}>
      {/* 검색창 */}
      <div className={cn(
  "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all",
  isFocused
    ? "border-gray-500 bg-gray-900 w-56"
    : "border-gray-800 bg-gray-900/50 w-36"
)} style={{ maxWidth: isFocused ? "224px" : "144px" }}>
        {isLoading ? (
          <div className="w-3.5 h-3.5 border border-gray-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="영화 검색..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none min-w-0"
        />
        {query && (
          <button onClick={handleClear}>
            <X className="w-3.5 h-3.5 text-gray-500 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* 드롭다운 결과 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl z-40">
          {results.map((movie, i) => (
            <button
              key={movie.id}
              onClick={() => handleSelect(movie)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 transition-colors text-left",
                i < results.length - 1 && "border-b border-gray-800"
              )}
            >
              {/* 포스터 썸네일 */}
              <div className="w-8 h-12 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                {movie.poster_path ? (
                  <Image
                    src={"https://image.tmdb.org/t/p/w92" + movie.poster_path}
                    alt={movie.title}
                    width={32}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-3 h-3 text-gray-600" />
                  </div>
                )}
              </div>

              {/* 영화 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                {movie.original_title !== movie.title && (
                  <p className="text-[10px] text-gray-500 truncate">{movie.original_title}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  {movie.release_date && (
                    <span className="text-[10px] text-gray-600">
                      {movie.release_date.slice(0, 4)}
                    </span>
                  )}
                  {movie.vote_average > 0 && (
                    <span className="text-[10px] text-yellow-500">
                      ★ {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* 하단 안내 */}
          <div className="px-3 py-2 border-t border-gray-800">
            <p className="text-[10px] text-gray-600 text-center">
              TMDB 데이터 기반 검색 결과
            </p>
          </div>
        </div>
      )}

      {/* 결과 없음 */}
      {isOpen && results.length === 0 && !isLoading && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-center shadow-2xl z-40">
          <Film className="w-6 h-6 mx-auto mb-1.5 text-gray-600" />
          <p className="text-xs text-gray-500">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Calendar, MapPin, Clapperboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const DEPT_LABELS: Record<string, string> = {
  Acting: "배우",
  Directing: "감독",
  Writing: "각본",
  Production: "제작",
  "Visual Effects": "VFX",
  Camera: "촬영",
  Editing: "편집",
  Sound: "음향",
  Art: "미술",
};

function calcAge(birthday: string): string {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age + "세";
}

function formatYear(dateStr: string): string {
  return dateStr ? dateStr.slice(0, 4) : "—";
}

function BiographyText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <p className="text-sm text-gray-600 italic">소개 정보가 없습니다.</p>;
  const isLong = text.length > 300;
  return (
    <div>
      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
        {expanded || !isLong ? text : text.slice(0, 300) + "..."}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-red-500 hover:text-red-400 mt-2 transition-colors"
        >
          {expanded ? "접기 ↑" : "더보기 ↓"}
        </button>
      )}
    </div>
  );
}

function MovieCard({ movie, role }: { movie: any; role?: string }) {
  return (
    <Link href={`/movie/tmdb-${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden mb-2">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Clapperboard className="w-8 h-8 text-gray-600" />
          </div>
        )}
        {/* 평점 뱃지 */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/70 px-1.5 py-0.5 rounded-md">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] text-white font-medium">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
      </div>
      <p className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">
        {movie.title}
      </p>
      <p className="text-[10px] text-gray-600 mt-0.5">{formatYear(movie.release_date)}</p>
      {role && <p className="text-[10px] text-gray-600 line-clamp-1">{role}</p>}
    </Link>
  );
}

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cast" | "crew">("cast");
  const [sortBy, setSortBy] = useState<"popular" | "year">("popular");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/person/${id}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setPerson(d); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-6 mb-8">
          <div className="w-40 h-56 bg-gray-800 rounded-2xl animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-7 bg-gray-800 rounded-xl w-48 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-32 animate-pulse" />
            <div className="h-20 bg-gray-800 rounded-xl animate-pulse mt-4" />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">인물 정보를 찾을 수 없습니다</p>
        <Link href="/" className="text-red-500 text-xs mt-2 inline-block hover:text-red-400">
          홈으로
        </Link>
      </div>
    );
  }

  const hasCast = person.cast?.length > 0;
  const hasCrew = person.crew?.length > 0;
  const activeTab = hasCast ? tab : "crew";

  const films: any[] = activeTab === "cast" ? (person.cast ?? []) : (person.crew ?? []);
  const sorted = [...films].sort((a, b) => {
    if (sortBy === "year") return (b.release_date ?? "").localeCompare(a.release_date ?? "");
    return b.popularity - a.popularity;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6 -ml-1 px-1 py-2"
      >
        <ArrowLeft className="w-4 h-4" /> 뒤로
      </button>

      {/* 인물 헤더 */}
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 mb-8">
        {/* 프로필 사진 */}
        <div className="flex-shrink-0 flex sm:block justify-center">
          {person.profile_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
              alt={person.name}
              width={140}
              height={196}
              className="rounded-2xl object-cover shadow-2xl w-28 sm:w-[140px]"
            />
          ) : (
            <div className="w-28 h-40 sm:w-[140px] sm:h-[196px] bg-gray-800 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-gray-600" />
            </div>
          )}
        </div>

        {/* 인물 정보 */}
        <div className="flex-1 min-w-0 sm:pt-1">
          {/* 직군 배지 */}
          {person.known_for_department && (
            <span className="inline-block text-[10px] text-red-400 border border-red-800 px-2 py-0.5 rounded-full mb-2">
              {DEPT_LABELS[person.known_for_department] ?? person.known_for_department}
            </span>
          )}
          <h1 className="text-2xl font-black text-white mb-3">{person.name}</h1>

          <div className="space-y-1.5 mb-4">
            {person.birthday && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <span>
                  {person.birthday.replace(/-/g, ".")}
                  <span className="text-gray-600 ml-2">({calcAge(person.birthday)})</span>
                </span>
              </div>
            )}
            {person.place_of_birth && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <span className="truncate">{person.place_of_birth}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clapperboard className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              <span>
                {hasCast && `출연작 ${person.cast.length}편`}
                {hasCast && hasCrew && " · "}
                {hasCrew && `연출작 ${person.crew.length}편`}
              </span>
            </div>
          </div>

          <BiographyText text={person.biography} />
        </div>
      </div>

      {/* 필모그래피 탭 + 정렬 */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1">
          {hasCast && (
            <button
              onClick={() => setTab("cast")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "cast" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              출연작
              <span className="ml-1.5 text-xs text-gray-500">{person.cast.length}</span>
            </button>
          )}
          {hasCrew && (
            <button
              onClick={() => setTab("crew")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "crew" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              연출작
              <span className="ml-1.5 text-xs text-gray-500">{person.crew.length}</span>
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {(["popular", "year"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                sortBy === s
                  ? "bg-white text-black border-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              )}
            >
              {s === "popular" ? "인기순" : "최신순"}
            </button>
          ))}
        </div>
      </div>

      {/* 영화 그리드 */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Clapperboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">작품 정보가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sorted.map((movie: any) => (
            <MovieCard
              key={movie.id + (movie.character ?? movie.job ?? "")}
              movie={movie}
              role={activeTab === "cast" ? movie.character : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

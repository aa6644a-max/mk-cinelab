"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Sparkles, Copy, Send, RotateCcw,
  CheckCircle, Film, Tag, Pen,
  Search, X, Star, Calendar, ChevronRight
} from "lucide-react";

const TMDB_GENRES: Record<number, string> = {
  28: "액션", 12: "어드벤처", 16: "애니메이션", 35: "코미디", 80: "범죄",
  99: "다큐멘터리", 18: "드라마", 10751: "가족", 14: "판타지", 36: "역사",
  27: "공포", 10402: "음악", 9648: "미스터리", 10749: "로맨스", 878: "SF",
  10770: "TV 영화", 53: "스릴러", 10752: "전쟁", 37: "서부",
};
import { cn } from "@/lib/utils";

const EMOTION_KEYWORDS = [
  "#감동적인", "#슬픈", "#무서운", "#웃긴", "#설레는",
  "#불편한", "#위로받은", "#충격적인", "#따뜻한", "#허무한",
  "#짜릿한", "#여운이긴", "#답답한", "#통쾌한", "#몽환적인",
];

const STYLES = [
  { id: "critic", label: "평론가 모드", desc: "씨네21 스타일의 지적인 분석", icon: "🎭" },
  { id: "emotional", label: "감성 모드", desc: "영화의 여운을 섬세하게", icon: "🌙" },
  { id: "blog", label: "블로그 모드", desc: "읽기 편한 추천 포스팅", icon: "✍️" },
  { id: "sns", label: "SNS 모드", desc: "인스타 캡션용 짧은 글", icon: "📱" },
];

const LOADING_MESSAGES = [
  "TMDB 데이터 분석 중...",
  "사용자 감상에서 핵심 키워드 추출 중...",
  "영화의 맥락과 감정을 연결 중...",
  "전문 문체로 다듬는 중...",
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { icon: Film, label: "영화 선택" },
    { icon: Tag, label: "감상 입력" },
    { icon: Pen, label: "문체 선택" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const stepNum = i + 1;
        const isDone = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              isDone ? "bg-green-900/40 border border-green-700 text-green-400"
                : isActive ? "bg-red-900/40 border border-red-600 text-red-300"
                : "bg-gray-900 border border-gray-700 text-gray-500"
            )}>
              {isDone ? <CheckCircle className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-8 h-px", currentStep > stepNum ? "bg-green-700" : "bg-gray-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoadingOverlay({ messages }: { messages: string[] }) {
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages]);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-700" />
        <div className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-red-400" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse min-h-[20px]">{messages[msgIndex]}</p>
    </div>
  );
}

export default function ReviewLabPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [movieTitle, setMovieTitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [customKeyword, setCustomKeyword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState("");
  const [matchScore, setMatchScore] = useState(0);
  const [poster, setPoster] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [nameError, setNameError] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // 영화 상세 페이지에서 진입 시 영화 선택 단계 자동 건너뜀
  useEffect(() => {
    const tmdbId = searchParams.get("tmdbId");
    const title = searchParams.get("title");
    if (!tmdbId || !title) return;

    const posterPath = searchParams.get("poster") ?? "";
    const year = searchParams.get("year") ?? "";
    const rating = parseFloat(searchParams.get("rating") ?? "0");
    const genreIds = (searchParams.get("genres") ?? "")
      .split(",")
      .map(Number)
      .filter(Boolean);

    setMovieTitle(title);
    setSelectedMovie({
      id: Number(tmdbId),
      title,
      original_title: title,
      poster_path: posterPath,
      release_date: year ? year + "-01-01" : "",
      vote_average: rating,
      genre_ids: genreIds,
      overview: "",
    });
    setStep(2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const addCustomKeyword = () => {
    if (!customKeyword.trim()) return;
    const kw = customKeyword.trim().startsWith("#")
      ? customKeyword.trim()
      : "#" + customKeyword.trim();
    if (!selectedKeywords.includes(kw)) {
      setSelectedKeywords((prev) => [...prev, kw]);
    }
    setCustomKeyword("");
  };

  const handleGenerate = async () => {
    if (!movieTitle.trim() || !userInput.trim() || !selectedStyle) return;
    setIsLoading(true);
    setReview("");
    setSaved(false);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle: movieTitle.trim(),
          userInput: userInput.trim(),
          keywords: selectedKeywords,
          style: selectedStyle,
        }),
      });
      const data = await res.json();
      if (data.review) {
        setReview(data.review);
        setMatchScore(data.matchScore);
        setPoster(data.poster);
        setStep(4);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        alert("리뷰 생성에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
  if (!user && !guestName.trim()) {
    setNameError("닉네임을 입력해주세요");
    return;
  }
  setNameError("");
  setIsSaving(true);
  try {
      const res = await fetch("/api/review/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle,
          moviePoster: poster,
          userInput,
          inputKeywords: selectedKeywords,
          style: selectedStyle,
          content: review,
          matchScore,
          guestNickname: guestName,
          guestEmail: guestEmail,  // 추가
          userId: user?.id ?? null, // 추가
}),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
      } else {
        alert("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setMovieTitle(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearch = async () => {
    const q = movieTitle.trim();
    if (q.length < 1) return;
    setIsSearching(true);
    setShowDropdown(false);
    try {
      const res = await fetch("/api/search?q=" + encodeURIComponent(q));
      const data = await res.json();
      setSearchResults(data.results ?? []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMovie = (movie: any) => {
    setMovieTitle(movie.title);
    setSelectedMovie(movie);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleReset = () => {
    setStep(1);
    setMovieTitle("");
    setSelectedMovie(null);
    setSearchResults([]);
    setShowDropdown(false);
    setUserInput("");
    setSelectedKeywords([]);
    setSelectedStyle(null);
    setCustomKeyword("");
    setReview("");
    setMatchScore(0);
    setPoster(null);
    setSaved(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-xs font-bold text-red-500 tracking-widest mb-2 uppercase">AI 비평실</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">내 감상을 전문 리뷰로</h1>
        <p className="text-sm text-gray-400">AI가 당신의 감상을 전문적인 문체로 다듬어줍니다</p>
      </div>

      {!isLoading && step < 4 && <StepIndicator currentStep={step} />}

      {/* Step 1: 영화 선택 */}
      {step === 1 && (
        <div className="animate-in fade-in duration-300 space-y-4">
          {/* 검색 인풋 */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">리뷰를 쓸 영화 제목을 입력하세요</label>
            <div className="flex gap-2">
              <div className={cn(
                "flex items-center gap-2 flex-1 bg-gray-900 border rounded-xl px-4 py-3 transition-colors",
                "border-gray-700 focus-within:border-red-600"
              )}>
                <input
                  type="text"
                  value={movieTitle}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                    if (e.key === "Escape") setShowDropdown(false);
                  }}
                  placeholder="예: 인터스텔라, 기생충..."
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-base"
                />
                {movieTitle && (
                  <button onClick={() => { setMovieTitle(""); setSearchResults([]); setShowDropdown(false); setSelectedMovie(null); }}>
                    <X className="w-4 h-4 text-gray-600 hover:text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={!movieTitle.trim() || isSearching}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all flex-shrink-0",
                  movieTitle.trim() && !isSearching
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
              >
                {isSearching
                  ? <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                  : <Search className="w-4 h-4" />}
                검색
              </button>
            </div>
          </div>

          {/* 검색 결과 리스트 */}
          {showDropdown && (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((movie, i) => (
                    <button
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-800 transition-colors text-left",
                        i < searchResults.length - 1 && "border-b border-gray-800",
                        selectedMovie?.id === movie.id && "bg-gray-800"
                      )}
                    >
                      <div className="w-10 h-14 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                        {movie.poster_path ? (
                          <Image src={"https://image.tmdb.org/t/p/w92" + movie.poster_path} alt={movie.title} width={40} height={56} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Film className="w-3 h-3 text-gray-600" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                        {movie.original_title !== movie.title && (
                          <p className="text-[11px] text-gray-500 truncate">{movie.original_title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {movie.release_date && (
                            <span className="text-[11px] text-gray-500">{movie.release_date.slice(0, 4)}</span>
                          )}
                          {movie.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] text-yellow-500">
                              <Star className="w-2.5 h-2.5 fill-yellow-500" />{movie.vote_average.toFixed(1)}
                            </span>
                          )}
                          {movie.genre_ids?.slice(0, 2).map((gid: number) => TMDB_GENRES[gid]).filter(Boolean).map((name: string) => (
                            <span key={name} className="text-[10px] text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded-full">{name}</span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    </button>
                  ))}
                  <div className="px-4 py-2 border-t border-gray-800">
                    <p className="text-[10px] text-gray-600 text-center">TMDB 검색 결과 · 영화를 선택해주세요</p>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <Film className="w-7 h-7 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
                  <p className="text-xs text-gray-600 mt-1">제목을 직접 입력 후 감상 입력하기를 눌러 진행할 수 있습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 선택된 영화 정보 */}
          {selectedMovie && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-gray-900/80 border border-red-900/50 rounded-2xl overflow-hidden">
              <div className="flex gap-4 p-4">
                {selectedMovie.poster_path ? (
                  <Image
                    src={"https://image.tmdb.org/t/p/w185" + selectedMovie.poster_path}
                    alt={selectedMovie.title}
                    width={72}
                    height={108}
                    className="rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[72px] h-[108px] bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Film className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-red-500 font-semibold tracking-widest uppercase mb-1">선택된 영화</p>
                  <h3 className="text-base font-bold text-white leading-snug">{selectedMovie.title}</h3>
                  {selectedMovie.original_title !== selectedMovie.title && (
                    <p className="text-xs text-gray-500 mb-2">{selectedMovie.original_title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {selectedMovie.release_date && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />{selectedMovie.release_date.slice(0, 4)}
                      </span>
                    )}
                    {selectedMovie.vote_average > 0 && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />{selectedMovie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {selectedMovie.genre_ids?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedMovie.genre_ids.slice(0, 4).map((gid: number) => TMDB_GENRES[gid]).filter(Boolean).map((name: string) => (
                        <span key={name} className="text-[10px] border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">{name}</span>
                      ))}
                    </div>
                  )}
                  {selectedMovie.overview && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{selectedMovie.overview}</p>
                  )}
                </div>
              </div>

              {/* 감상 입력하기 버튼 */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                >
                  <Pen className="w-4 h-4" />
                  감상 입력하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: 감상 입력 + 키워드 */}
      {step === 2 && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg w-fit">
            <Film className="w-4 h-4 text-red-500" />
            <span className="text-sm text-white font-medium">{movieTitle}</span>
            <button onClick={() => {
              const tmdbId = searchParams.get("tmdbId");
              if (tmdbId) { window.history.back(); return; }
              setStep(1); setSelectedMovie(null); setShowDropdown(false);
            }} className="text-gray-600 hover:text-gray-400 text-xs ml-1">수정</button>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              한 줄 감상을 자유롭게 적어주세요
              <span className="text-gray-600 ml-2 text-xs">(AI가 이 내용을 바탕으로 리뷰를 다듬어줍니다)</span>
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="예: 반전 장면에서 소름이 돋았고 영상미가 정말 압도적이었다."
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors resize-none text-sm leading-relaxed"
            />
            <div className="text-right text-xs text-gray-600 mt-1">{userInput.length}자</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-3 block">
              감정 키워드 선택
              <span className="text-gray-600 ml-2 text-xs">(선택사항 — 리뷰에 반영됩니다)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {EMOTION_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => toggleKeyword(kw)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs transition-all",
                    selectedKeywords.includes(kw)
                      ? "bg-red-600 border-red-500 text-white"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                  )}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* 직접 입력 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addCustomKeyword(); }}
                placeholder="직접 입력 후 Enter (예: 잔잔한)"
                maxLength={15}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
              />
              <button
                onClick={addCustomKeyword}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
              >
                추가
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Enter 또는 추가 버튼으로 직접 키워드를 만들 수 있습니다</p>

            {selectedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-xs text-gray-600 self-center">선택됨:</span>
                {selectedKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => toggleKeyword(kw)}
                    className="text-xs bg-red-950/50 border border-red-800 text-red-300 px-2 py-0.5 rounded-full hover:bg-red-900/50 transition-colors"
                  >
                    {kw} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">이전</button>
            <button
              onClick={() => setStep(3)}
              disabled={!userInput.trim()}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                userInput.trim() ? "bg-red-600 hover:bg-red-500 text-white" : "bg-gray-800 text-gray-600 cursor-not-allowed"
              )}
            >
              다음 — 문체 선택하기
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 문체 선택 */}
      {step === 3 && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg w-fit">
            <Film className="w-4 h-4 text-red-500" />
            <span className="text-sm text-white font-medium">{movieTitle}</span>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-3 block">어떤 스타일로 다듬어 드릴까요?</label>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    selectedStyle === s.id
                      ? "bg-red-900/40 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                      : "bg-gray-900 border-gray-800 hover:border-gray-600"
                  )}
                >
                  <div className="text-xl mb-2">{s.icon}</div>
                  <div className="font-bold text-sm text-white mb-1">{s.label}</div>
                  <div className="text-xs text-gray-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">이전</button>
            <button
              onClick={handleGenerate}
              disabled={!selectedStyle || isLoading}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
                selectedStyle ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "bg-gray-800 text-gray-600 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              리뷰 생성하기
            </button>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {isLoading && <LoadingOverlay messages={LOADING_MESSAGES} />}

      {/* Step 4: 결과 */}
      {step === 4 && review && !isLoading && (
        <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            {poster ? (
              <Image src={poster} alt={movieTitle} width={52} height={78} className="rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-[52px] h-[78px] bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Film className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">{movieTitle}</h2>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[10px] border border-purple-700 text-purple-400 bg-purple-950/30 px-2 py-0.5 rounded-full">AI Assisted</span>
                <span className="text-[10px] border border-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                  {STYLES.find((s) => s.id === selectedStyle)?.label}
                </span>
                {selectedKeywords.map((kw) => (
                  <span key={kw} className="text-[10px] border border-red-900 text-red-400 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">감상 반영도</span>
              <span className="text-xs font-bold text-red-400">{matchScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full transition-all duration-1000"
                style={{ width: matchScore + "%" }}
              />
            </div>
            <p className="text-[11px] text-gray-600">입력하신 감상과 키워드를 바탕으로 AI가 다듬었습니다</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6">
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{review}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 text-sm transition-all flex-1 justify-center"
            >
              {copied
                ? <><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-green-400">복사됨!</span></>
                : <><Copy className="w-4 h-4" />복사하기</>}
            </button>
            <button
              onClick={() => { setStep(3); setReview(""); }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 text-sm transition-all flex-1 justify-center"
            >
              <RotateCcw className="w-4 h-4" />다시 생성
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all flex-1 justify-center"
            >
              <Send className="w-4 h-4" />새 리뷰 작성
            </button>
          </div>

          <div className="space-y-3">
            {!user && !loading && !saved && (
              <div className="space-y-2 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-xs text-gray-400 font-medium mb-3">발행자 정보</p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    닉네임 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => { setGuestName(e.target.value); setNameError(""); }}
                    placeholder="표시될 닉네임 입력"
                    maxLength={20}
                    className={cn(
                      "w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors",
                      nameError ? "border-red-600" : "border-gray-700 focus:border-red-600"
                    )}
                  />
                  {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    이메일
                    <span className="text-gray-600 ml-1">(선택 — 나중에 로그인하면 내 리뷰로 연결)</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || saved}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold border transition-all",
                saved
                  ? "border-green-700 text-green-400 bg-green-950/30"
                  : isSaving
                  ? "border-gray-700 text-gray-500 cursor-wait"
                  : "border-gray-700 text-gray-400 hover:border-white hover:text-white"
              )}
            >
              {saved ? "✓ 게시판에 발행됨" : isSaving ? "저장 중..." : "게시판에 발행하기"}
            </button>
            {!user && !saved && (
              <p className="text-[11px] text-gray-600 text-center">
                로그인 없이 발행 가능 · 이메일 입력 시 나중에 로그인하면 내 리뷰로 연결됩니다
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
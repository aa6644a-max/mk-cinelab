"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── 데이터 정의 ───────────────────────────────────────────

const genres = [
  "액션", "모험", "SF", "로맨스", "드라마",
  "스릴러", "공포", "범죄", "코미디", "애니메이션", "스포츠",
];

const questions = {
  runningTime: {
    label: "오늘 영화에 투자할 수 있는 시간은?",
    step: "02",
    options: [
      { val: "90분 미만", desc: "부담 없이 가볍고 빠르게 즐기고 싶을 때" },
      { val: "90분 ~ 120분", desc: "가장 대중적이고 몰입하기 좋은 시간" },
      { val: "120분 ~ 150분", desc: "이야기 속에 푹 빠져들 준비가 되었을 때" },
      { val: "150분 이상", desc: "대작의 웅장함과 긴 호흡을 견뎌낼 때" },
    ],
  },
  tempo: {
    label: "영화의 전체적인 속도감은?",
    step: "03",
    options: [
      { val: "쉴 새 없이 몰아치는 폭주형", desc: "한순간도 눈을 뗄 수 없는 아드레날린" },
      { val: "리드미컬하고 경쾌한 속도", desc: "지루할 틈 없이 통통 튀는 전개" },
      { val: "인물의 감정을 음미하는 호흡", desc: "사건보다는 인물의 내면에 집중" },
      { val: "정적인 미학이 돋보이는 느린 호흡", desc: "여백의 미와 깊은 사유가 있는 영화" },
    ],
  },
  character: {
    label: "어떤 인물에게 끌리시나요?",
    step: "04",
    options: [
      { val: "강인하고 카리스마 넘치는 영웅", desc: "압도적인 존재감으로 이끌어가는 주인공" },
      { val: "평범하지만 성장하는 인물", desc: "나와 닮은 캐릭터의 변화에 공감" },
      { val: "도덕적으로 복잡한 안티히어로", desc: "선과 악의 경계에서 갈등하는 입체적 인물" },
      { val: "미스터리하고 예측불가한 캐릭터", desc: "끝까지 속을 알 수 없는 매력" },
    ],
  },
  visual: {
    label: "오늘 눈으로 즐기고 싶은 시각적 무드는?",
    step: "05",
    options: [
      { val: "강렬한 대비와 어두운 그림자", desc: "묵직하고 다크한 느와르 스타일" },
      { val: "차갑고 건조한 무채색의 질감", desc: "리얼리즘이 살아있는 도시미" },
      { val: "따뜻한 햇살이 스며드는 파스텔톤", desc: "마음이 편안해지는 아날로그 감성" },
      { val: "상상력이 극대화된 화려한 색감", desc: "시각적 쾌감을 주는 판타지적 미장센" },
    ],
  },
};

const keywordList = [
  "#몽환적인", "#다크한", "#가슴따뜻한", "#냉소적인", "#힙한", "#복고풍",
  "#반전소름", "#실화바탕", "#타임루프", "#디스토피아", "#우정", "#복수극",
  "#색감이예쁜", "#흑백영화", "#압도적스케일", "#아기자기한", "#예술영화",
];

// ─── 타입 ───────────────────────────────────────────────────

interface ResultMovie {
  title: string;
  reason: string;
  poster: string | null;
  id: number | null;
  releaseYear: string;
  runtime: string | number;
  director: string;
  ratings: { imdb: string; rotten: string; metacritic: string };
}

// ─── 프로그레스 바 ──────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i < current - 1
              ? "w-6 bg-red-500"
              : i === current - 1
              ? "w-8 bg-red-400"
              : "w-6 bg-gray-700"
          )}
        />
      ))}
    </div>
  );
}

// ─── 선택 카드 그리드 ────────────────────────────────────────

function ChoiceGrid({
  options,
  selected,
  onSelect,
}: {
  options: { val: string; desc: string }[];
  selected: string | null;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10">
      {options.map((item) => (
        <button
          key={item.val}
          onClick={() => onSelect(item.val)}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all duration-200",
            selected === item.val
              ? "bg-red-900/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-[1.01]"
              : "bg-gray-900 border-gray-800 hover:border-gray-600"
          )}
        >
          <div className="font-bold text-base text-white mb-1">{item.val}</div>
          <div className="text-sm text-gray-400">{item.desc}</div>
        </button>
      ))}
    </div>
  );
}

// ─── 네비 버튼 ──────────────────────────────────────────────

function NavButtons({
  onPrev,
  onNext,
  nextLabel = "다음 질문",
  nextDisabled = false,
  isLoading = false,
}: {
  onPrev?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="flex justify-center items-center gap-6">
      {onPrev && (
        <button
          onClick={onPrev}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 이전
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled || isLoading}
        className={cn(
          "flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all",
          nextDisabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : isLoading
            ? "bg-gray-600 text-gray-300 cursor-wait animate-pulse"
            : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        )}
      >
        {isLoading ? (
          <>
            <Sparkles className="w-4 h-4 animate-spin" />
            3편의 영화를 찾는 중...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ─── 결과 카드 ──────────────────────────────────────────────

function ResultCard({
  movie,
  index,
  selections,
}: {
  movie: ResultMovie;
  index: number;
  selections: Record<string, string>;
}) {
  // 취향 일치도 — reason 텍스트 길이와 선택 조건 수로 간단히 산출
  const matchScore = Math.min(
    88 + index * 3 + (movie.reason.length > 80 ? 4 : 0),
    99
  );

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:border-gray-500 transition-all group">
      {/* 포스터 */}
      <div className="w-full md:w-[240px] shrink-0 bg-black flex">
        {movie.poster ? (
          <Image
            src={movie.poster}
            alt={movie.title}
            width={240}
            height={360}
            className="w-full h-full object-cover aspect-[2/3] md:aspect-auto opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full min-h-[320px] md:min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border-r border-gray-700/50 p-6 text-center gap-3">
            <span className="text-lg font-black text-gray-400 break-keep leading-relaxed">
              {movie.title}
            </span>
            <span className="text-[10px] font-medium text-gray-500 tracking-widest border border-gray-600 px-3 py-1 rounded-full">
              POSTER NOT FOUND
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-col flex-1 p-7 justify-center gap-4">
        {/* 제목 + 배지 */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-red-500 tracking-widest">
              #{index + 1} PICK
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-purple-700 text-purple-400 bg-purple-950/30"
            >
              AI Assisted
            </Badge>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
            {movie.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">
              {movie.releaseYear}
            </span>
            <span className="bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">
              {movie.runtime}분
            </span>
            <span className="bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">
              {movie.director}
            </span>
          </div>
        </div>

        {/* 평점 */}
        <div className="flex gap-5 pb-4 border-b border-gray-800">
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">IMDb</div>
            <div className="text-lg font-black text-yellow-400">{movie.ratings.imdb}</div>
          </div>
          <div className="pl-5 border-l border-gray-800">
            <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">ROTTEN</div>
            <div className="text-lg font-black text-red-400">{movie.ratings.rotten}</div>
          </div>
          <div className="pl-5 border-l border-gray-800">
            <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">META</div>
            <div className="text-lg font-black text-blue-400">{movie.ratings.metacritic}</div>
          </div>
        </div>

        {/* 추천 이유 */}
        <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-red-600 pl-4 italic">
          {movie.reason}
        </p>

        {/* 취향 일치도 바 ★ 신뢰도 장치 */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">취향 일치도</span>
            <span className="text-xs font-bold text-red-400">{matchScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full transition-all duration-1000"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* 상세 보기 */}
        {movie.id && (
          <Link href={`/movie/tmdb-${movie.id}`}>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold text-sm border border-gray-600 transition-all">
              상세 정보 보기
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────

export default function RecommendPage() {
  const [step, setStep] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [runningTime, setRunningTime] = useState<string | null>(null);
  const [tempoAnswer, setTempoAnswer] = useState<string | null>(null);
  const [characterAnswer, setCharacterAnswer] = useState<string | null>(null);
  const [visualAnswer, setVisualAnswer] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultMovies, setResultMovies] = useState<ResultMovie[]>([]);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const handleShowResult = async () => {
    if (!selectedGenre || !runningTime || !tempoAnswer || !characterAnswer || !visualAnswer) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: selectedGenre,
          runningTime,
          tempo: tempoAnswer,
          character: characterAnswer,
          visual: visualAnswer,
          keywords: selectedKeywords,
        }),
      });
      const data = await res.json();
      if (data.movies) {
        setResultMovies(data.movies);
        setStep(7);
      } else {
        alert("추천을 불러오지 못했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedGenre(null);
    setRunningTime(null);
    setTempoAnswer(null);
    setCharacterAnswer(null);
    setVisualAnswer(null);
    setSelectedKeywords([]);
    setResultMovies([]);
  };

  // 선택 조건 요약 (결과 헤더용)
  const selectionSummary = [
    selectedGenre,
    runningTime,
    tempoAnswer,
    characterAnswer,
    visualAnswer,
    ...selectedKeywords,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center min-h-[70vh] flex flex-col justify-center">

      {/* ── Step 1: 장르 ── */}
      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <ProgressBar current={1} total={6} />
          <header className="mb-10">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">STEP 01 / 06</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-white">
              AI 취향 큐레이션
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
              오늘 어떤 무드의 영화가 당기시나요?
            </p>
          </header>
          <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-2xl mx-auto">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  "px-5 py-2.5 rounded-full border transition-all duration-200 text-sm font-medium",
                  selectedGenre === genre
                    ? "bg-red-600 border-red-500 text-white scale-105"
                    : "bg-gray-900 border-gray-700 text-gray-300 hover:border-red-500 hover:text-red-400"
                )}
              >
                {genre}
              </button>
            ))}
          </div>
          <NavButtons
            onNext={() => setStep(2)}
            nextLabel={selectedGenre ? `'${selectedGenre}' 심층 분석 시작하기` : "장르를 선택해 주세요"}
            nextDisabled={!selectedGenre}
          />
        </div>
      )}

      {/* ── Step 2: 러닝타임 ── */}
      {step === 2 && (
        <div className="animate-in fade-in duration-300">
          <ProgressBar current={2} total={6} />
          <header className="mb-10">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">STEP 02 / 06</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              {questions.runningTime.label}
            </h2>
          </header>
          <ChoiceGrid
            options={questions.runningTime.options}
            selected={runningTime}
            onSelect={setRunningTime}
          />
          <NavButtons
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
            nextDisabled={!runningTime}
          />
        </div>
      )}

      {/* ── Step 3: 템포 ── */}
      {step === 3 && (
        <div className="animate-in fade-in duration-300">
          <ProgressBar current={3} total={6} />
          <header className="mb-10">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">STEP 03 / 06</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              {questions.tempo.label}
            </h2>
          </header>
          <ChoiceGrid
            options={questions.tempo.options}
            selected={tempoAnswer}
            onSelect={setTempoAnswer}
          />
          <NavButtons
            onPrev={() => setStep(2)}
            onNext={() => setStep(4)}
            nextDisabled={!tempoAnswer}
          />
        </div>
      )}

      {/* ── Step 4: 인물 유형 ── */}
      {step === 4 && (
        <div className="animate-in fade-in duration-300">
          <ProgressBar current={4} total={6} />
          <header className="mb-10">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">STEP 04 / 06</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              {questions.character.label}
            </h2>
          </header>
          <ChoiceGrid
            options={questions.character.options}
            selected={characterAnswer}
            onSelect={setCharacterAnswer}
          />
          <NavButtons
            onPrev={() => setStep(3)}
            onNext={() => setStep(5)}
            nextDisabled={!characterAnswer}
          />
        </div>
      )}

      {/* ── Step 5: 시각 무드 ── */}
      {step === 5 && (
        <div className="animate-in fade-in duration-300">
          <ProgressBar current={5} total={6} />
          <header className="mb-10">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">STEP 05 / 06</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              {questions.visual.label}
            </h2>
          </header>
          <ChoiceGrid
            options={questions.visual.options}
            selected={visualAnswer}
            onSelect={setVisualAnswer}
          />
          <NavButtons
            onPrev={() => setStep(4)}
            onNext={() => setStep(6)}
            nextDisabled={!visualAnswer}
          />
        </div>
      )}

      {/* ── Step 6: 키워드 ── */}
      {step === 6 && (
        <div className="animate-in fade-in duration-300">
          <ProgressBar current={6} total={6} />
          <header className="mb-8">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">
              FINAL STEP (OPTIONAL)
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
              취향 한 스푼 더 넣기
            </h2>
            <p className="text-gray-400 text-sm">
              더 고르고 싶은 키워드가 있다면 선택해 주세요 — 없으면 바로 결과 보기
            </p>
          </header>

          <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
            {keywordList.map((kw) => (
              <button
                key={kw}
                onClick={() => toggleKeyword(kw)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-all",
                  selectedKeywords.includes(kw)
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                )}
              >
                {kw}
              </button>
            ))}
          </div>

          {/* 선택된 키워드 요약 */}
          {selectedKeywords.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="text-xs text-gray-500 self-center">선택됨:</span>
              {selectedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs bg-red-950/50 border border-red-800 text-red-300 px-2.5 py-1 rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          <NavButtons
            onPrev={() => setStep(5)}
            onNext={handleShowResult}
            nextLabel="결과 보기"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* ── Step 7: 결과 ── */}
      {step === 7 && resultMovies.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <header className="mb-10">
            <p className="text-xs font-bold text-red-500 mb-2 tracking-widest">
              MK CINELAB CURATION
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              당신의 취향을 저격할 3편의 영화
            </h1>
            {/* ★ 선택 조건 요약 태그 — 신뢰도 장치 */}
            <div className="flex flex-wrap justify-center gap-2">
              {selectionSummary.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-400 border border-gray-700 bg-gray-900 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              <span className="text-xs text-gray-600 self-center">기반 분석 결과</span>
            </div>
          </header>

          <div className="flex flex-col gap-8 mb-12 text-left">
            {resultMovies.map((movie, index) => (
              <ResultCard
                key={index}
                movie={movie}
                index={index}
                selections={{
                  genre: selectedGenre ?? "",
                  tempo: tempoAnswer ?? "",
                }}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 pb-8">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <RotateCcw className="w-4 h-4" />
              다시 테스트하기
            </button>
            <Link href="/">
              <button className="bg-transparent hover:bg-gray-800 text-gray-300 px-8 py-3.5 rounded-xl font-bold border border-gray-600 transition-all">
                메인으로
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
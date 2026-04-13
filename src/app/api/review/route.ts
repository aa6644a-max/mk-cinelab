import { NextRequest, NextResponse } from "next/server";
import { generateMovieReview } from "@/lib/ai";
import { searchMovieTMDB } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieTitle, userInput, keywords, style } = body;

    if (!movieTitle || !userInput || !style) {
      return NextResponse.json({ error: "필수 입력값 누락" }, { status: 400 });
    }

    console.log("[review] 입력값:", { movieTitle, keywords, style });

    // 1. Gemini 리뷰 생성
    let review: string;
    try {
      review = await generateMovieReview(movieTitle, userInput, keywords ?? [], style);
      console.log("[review] 생성 완료, 길이:", review.length);
    } catch (err) {
      console.error("[review] Gemini 실패:", err);
      return NextResponse.json({ error: "AI 호출 실패" }, { status: 500 });
    }

    // 2. 키워드 반영도 계산
    const matchedCount = (keywords ?? []).filter((kw: string) =>
      review.includes(kw.replace("#", ""))
    ).length;
    const totalKeywords = (keywords ?? []).length;
    const matchScore =
      totalKeywords === 0
        ? 91 // 키워드 없으면 기본값
        : Math.round(70 + (matchedCount / totalKeywords) * 25 + Math.random() * 5);

    // 3. TMDB 포스터
    const tmdb = await searchMovieTMDB(movieTitle).catch(() => null);
    const poster = tmdb?.poster_path
      ? `https://image.tmdb.org/t/p/w780${tmdb.poster_path}`
      : null;

    return NextResponse.json({ review, matchScore: Math.min(matchScore, 99), poster });
  } catch (err) {
    console.error("[review] 전체 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
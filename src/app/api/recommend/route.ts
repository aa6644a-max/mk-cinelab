import { NextRequest, NextResponse } from "next/server";
import { getMovieForCuration } from "@/lib/api";
import { getMovieRecommendation } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { genre, runningTime, tempo, character, visual, keywords } = body;

    console.log("[recommend] 입력값:", { genre, runningTime, tempo, character, visual, keywords });

    if (!genre || !runningTime || !tempo || !character || !visual) {
      return NextResponse.json({ error: "필수 입력값 누락" }, { status: 400 });
    }

    // 1. Gemini 호출
    let aiResult;
    try {
      aiResult = await getMovieRecommendation(
        genre, runningTime, tempo, character, visual, keywords ?? []
      );
      console.log("[recommend] Gemini 결과:", JSON.stringify(aiResult));
    } catch (aiErr) {
      console.error("[recommend] Gemini 호출 실패:", aiErr);
      return NextResponse.json({ error: "AI 호출 실패", detail: String(aiErr) }, { status: 500 });
    }

    if (!Array.isArray(aiResult)) {
      console.error("[recommend] aiResult가 배열이 아님:", aiResult);
      return NextResponse.json({ error: "AI 응답 형식 오류" }, { status: 500 });
    }

    // 2. TMDB 상세 조회
    const movies = await Promise.all(
      aiResult.map(async (movie: any) => {
        const tmdb = await getMovieForCuration(movie.title, movie.year).catch((e) => {
          console.error("[recommend] TMDB 조회 실패:", movie.title, e);
          return null;
        });
        return {
          title: movie.title,
          reason: movie.reason,
          poster: tmdb?.poster_path
            ? `https://image.tmdb.org/t/p/w780${tmdb.poster_path}`
            : null,
          id: tmdb?.id ?? null,
          releaseYear: tmdb?.releaseDate?.split("-")[0] ?? movie.year ?? "미상",
          runtime: tmdb?.runtime ?? "?",
          director: tmdb?.director ?? "정보 없음",
          ratings: tmdb?.ratings ?? { imdb: "N/A", rotten: "N/A", metacritic: "N/A" },
        };
      })
    );

    console.log("[recommend] 최종 결과 영화 수:", movies.length);
    return NextResponse.json({ movies });

  } catch (err) {
    console.error("[recommend] 전체 오류:", err);
    return NextResponse.json({ error: "서버 오류", detail: String(err) }, { status: 500 });
  }
}
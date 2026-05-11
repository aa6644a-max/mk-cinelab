import { NextResponse } from "next/server";
import { verifyAdmin, getAdminSupabaseClient } from "@/lib/adminAuth";
import { searchMovieTMDB } from "@/lib/api";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY;

function isValidPosterUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^https:\/\/image\.tmdb\.org\/t\/p\/w\d+\/.+/.test(url);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPosterByTmdbId(tmdbId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&language=ko-KR`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const authError = await verifyAdmin();
  if (authError) return authError;

  // force=true 이면 전체 재수선, 기본은 깨진 것만
  const force = new URL(req.url).searchParams.get("force") === "true";

  const supabase = getAdminSupabaseClient();

  const { data: allReviews, error: fetchError } = await supabase
    .from("reviews")
    .select("id, movie_title, movie_poster, tmdb_id");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const badReviews = force
    ? (allReviews ?? [])
    : (allReviews ?? []).filter((r) => !isValidPosterUrl(r.movie_poster));

  const result = {
    total: badReviews.length,
    fixed: 0,
    notFound: 0,
    failed: 0,
    details: [] as { title: string; status: string }[],
  };

  for (const review of badReviews) {
    let newPoster: string | null = null;
    let newTmdbId: number | null = null;

    if (review.tmdb_id && !force) {
      // 일반 모드: tmdb_id 있으면 직접 조회 (빠름)
      newPoster = await fetchPosterByTmdbId(review.tmdb_id);
    } else {
      // force 모드 또는 tmdb_id 없을 때: 제목으로 재검색 (매칭 로직 재적용)
      const tmdb = await searchMovieTMDB(review.movie_title).catch(() => null);
      if (tmdb?.poster_path) {
        newPoster = `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`;
        newTmdbId = tmdb.id;
      }
    }

    if (newPoster) {
      const updateData: Record<string, unknown> = { movie_poster: newPoster };
      if (newTmdbId) updateData.tmdb_id = newTmdbId;

      const { error: updateError } = await supabase
        .from("reviews")
        .update(updateData)
        .eq("id", review.id);

      if (updateError) {
        result.failed++;
        result.details.push({ title: review.movie_title, status: "실패: " + updateError.message });
      } else {
        result.fixed++;
        result.details.push({ title: review.movie_title, status: "복구 완료" });
      }
    } else {
      result.notFound++;
      result.details.push({ title: review.movie_title, status: "TMDB 결과 없음" });
    }

    await sleep(120); // TMDB 레이트 리밋 방지 (초당 ~8건)
  }

  return NextResponse.json(result);
}

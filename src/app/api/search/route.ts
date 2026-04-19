import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

function normalize(str: string) {
  return str.replace(/\s+/g, "").toLowerCase();
}

function mapResult(m: any) {
  return {
    id: m.id,
    title: m.title,
    original_title: m.original_title,
    poster_path: m.poster_path,
    release_date: m.release_date,
    vote_average: m.vote_average,
    genre_ids: m.genre_ids ?? [],
    overview: m.overview ?? "",
  };
}

async function tmdbSearch(q: string): Promise<any[]> {
  const res = await fetch(
    `${TMDB_BASE}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=ko-KR&region=KR&page=1`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    let raw = await tmdbSearch(query);

    // 결과 없고 공백 없는 쿼리면 — 앞 2글자로 넓게 재검색 후 공백 무시 매칭
    if (raw.length === 0 && !query.includes(" ")) {
      const broad = await tmdbSearch(query.slice(0, 2));
      const qNorm = normalize(query);
      raw = broad.filter((m: any) => {
        const titleNorm = normalize(m.title ?? "");
        const origNorm = normalize(m.original_title ?? "");
        return titleNorm.includes(qNorm) || origNorm.includes(qNorm);
      });
    }

    const results = raw.slice(0, 6).map(mapResult);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ results: [] });
  }
}
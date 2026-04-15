import { NextRequest, NextResponse } from "next/server";
import { searchMovieTMDB } from "@/lib/api";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ko-KR&region=KR&page=1`,
    );

    if (!res.ok) return NextResponse.json({ results: [] });

    const data = await res.json();
    const results = (data.results ?? [])
      .slice(0, 6)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        original_title: m.original_title,
        poster_path: m.poster_path,
        release_date: m.release_date,
        vote_average: m.vote_average,
        genre_ids: m.genre_ids ?? [],
        overview: m.overview ?? "",
      }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ results: [] });
  }
}
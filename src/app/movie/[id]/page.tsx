import { notFound } from "next/navigation";
import { getMovieDetail } from "@/lib/api";
import { createServerSupabase } from "@/lib/supabase-server";
import MovieDetailClient from "@/components/movie/MovieDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;

  // tmdb-12345 형태에서 숫자만 추출
  const tmdbId = Number(id.replace("tmdb-", ""));
  if (isNaN(tmdbId)) notFound();

  const movie = await getMovieDetail(tmdbId);
  if (!movie) notFound();

  // 이 영화의 리뷰 조회
  const supabase = await createServerSupabase();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id, content, style, input_keywords,
      match_score, is_ai_assisted, is_user_edited,
      created_at,
      profiles ( nickname, avatar_url, is_trusted )
    `)
    .eq("movie_title", movie.title)
    .order("created_at", { ascending: false })
    .limit(10);

  return <MovieDetailClient movie={movie} reviews={reviews ?? []} />;
}
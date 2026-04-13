import { createServerSupabase } from "@/lib/supabase-server";
import BoardClient from "@/components/board/BoardClient";

export const revalidate = 60; // 1분 캐시

async function getReviews(sort: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
  .from("reviews")
  .select(`
    id, movie_title, movie_poster, content, tmdb_id,
    input_keywords, style, is_ai_assisted, guest_nickname,
    match_score, like_count, created_at,
    profiles (
      id, nickname, avatar_url, is_trusted
    )
  `)
  .order(sort === "trust" ? "match_score" : "created_at", { ascending: false })
  .limit(20);

  if (error) {
    console.error("[board]", error);
    return [];
  }

  return data ?? [];
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "latest" } = await searchParams;
  const reviews = await getReviews(sort);

  return <BoardClient reviews={reviews} currentSort={sort} />;
}
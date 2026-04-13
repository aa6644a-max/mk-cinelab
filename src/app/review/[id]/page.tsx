import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ReviewDetailClient from "@/components/review/ReviewDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: review } = await supabase
  .from("reviews")
  .select(`
    id, movie_title, movie_poster, tmdb_id,
    content, style, input_keywords, user_input,
    match_score, is_ai_assisted, is_user_edited,
    guest_nickname,
    created_at,
    profiles ( id, nickname, avatar_url, is_trusted )
  `)
  .eq("id", id)
  .single();

  if (!review) notFound();

  return <ReviewDetailClient review={review} />;
}
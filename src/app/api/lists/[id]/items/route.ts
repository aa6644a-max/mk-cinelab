import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { userId, tmdbId, movieTitle, moviePoster } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!tmdbId || !movieTitle) return NextResponse.json({ error: "필수 정보가 누락되었습니다" }, { status: 400 });

    const supabase = await createServerSupabase();

    const { data: list } = await supabase
      .from("movie_lists")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!list || list.user_id !== userId) {
      return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("movie_list_items")
      .insert({
        list_id: id,
        tmdb_id: Number(tmdbId),
        movie_title: movieTitle,
        movie_poster: moviePoster ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 리스트에 추가된 영화입니다" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from("movie_lists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    console.error("[lists/[id]/items/post]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

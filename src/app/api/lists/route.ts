import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");
    const tmdbId = searchParams.get("tmdbId");

    if (!userId) {
      return NextResponse.json({ error: "userId가 필요합니다" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data: lists, error } = await supabase
      .from("movie_lists")
      .select("id, name, description, is_public, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!lists || lists.length === 0) {
      return NextResponse.json({ lists: [] });
    }

    const listIds = lists.map((l: any) => l.id);
    const { data: items } = await supabase
      .from("movie_list_items")
      .select("list_id, tmdb_id")
      .in("list_id", listIds);

    const countMap: Record<string, number> = {};
    const movieInListMap: Record<string, boolean> = {};
    for (const item of items ?? []) {
      countMap[item.list_id] = (countMap[item.list_id] ?? 0) + 1;
      if (tmdbId && item.tmdb_id === Number(tmdbId)) {
        movieInListMap[item.list_id] = true;
      }
    }

    const result = lists.map((l: any) => ({
      ...l,
      item_count: countMap[l.id] ?? 0,
      ...(tmdbId !== null && { contains_movie: movieInListMap[l.id] ?? false }),
    }));

    return NextResponse.json({ lists: result });
  } catch (err) {
    console.error("[lists/get]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, description, is_public } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!name?.trim()) return NextResponse.json({ error: "리스트 이름을 입력해주세요" }, { status: 400 });
    if (name.trim().length > 50) return NextResponse.json({ error: "리스트 이름은 50자 이내로 입력해주세요" }, { status: 400 });

    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("movie_lists")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: is_public ?? false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ list: { ...data, item_count: 0 } }, { status: 201 });
  } catch (err) {
    console.error("[lists/post]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

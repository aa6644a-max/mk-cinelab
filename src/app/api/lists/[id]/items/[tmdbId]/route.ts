import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface Props {
  params: Promise<{ id: string; tmdbId: string }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id, tmdbId } = await params;
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const supabase = await createServerSupabase();

    const { data: list } = await supabase
      .from("movie_lists")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!list || list.user_id !== userId) {
      return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });
    }

    const { error } = await supabase
      .from("movie_list_items")
      .delete()
      .eq("list_id", id)
      .eq("tmdb_id", Number(tmdbId));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase
      .from("movie_lists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lists/[id]/items/[tmdbId]/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

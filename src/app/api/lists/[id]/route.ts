import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const userId = req.nextUrl.searchParams.get("userId");

    const supabase = await createServerSupabase();

    const { data: list, error } = await supabase
      .from("movie_lists")
      .select("id, name, description, is_public, user_id, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !list) return NextResponse.json({ error: "리스트를 찾을 수 없습니다" }, { status: 404 });

    if (!list.is_public && list.user_id !== userId) {
      return NextResponse.json({ error: "접근 권한이 없습니다" }, { status: 403 });
    }

    const { data: items } = await supabase
      .from("movie_list_items")
      .select("id, tmdb_id, movie_title, movie_poster, added_at")
      .eq("list_id", id)
      .order("added_at", { ascending: false });

    return NextResponse.json({ list, items: items ?? [] });
  } catch (err) {
    console.error("[lists/[id]/get]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { userId, name, description, is_public } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (name !== undefined && !name?.trim()) return NextResponse.json({ error: "리스트 이름을 입력해주세요" }, { status: 400 });
    if (name && name.trim().length > 50) return NextResponse.json({ error: "리스트 이름은 50자 이내로 입력해주세요" }, { status: 400 });

    const supabase = await createServerSupabase();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (is_public !== undefined) updates.is_public = is_public;

    const { data, error } = await supabase
      .from("movie_lists")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "리스트를 찾을 수 없거나 권한이 없습니다" }, { status: 404 });

    return NextResponse.json({ list: data });
  } catch (err) {
    console.error("[lists/[id]/patch]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const supabase = await createServerSupabase();

    const { error } = await supabase
      .from("movie_lists")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lists/[id]/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

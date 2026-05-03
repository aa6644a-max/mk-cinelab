import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("review_comments")
      .select("id, content, created_at, user_id, profiles(nickname, avatar_url)")
      .eq("review_id", id)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comments: data ?? [] });
  } catch (err) {
    console.error("[comments/get]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { content, userId } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!content?.trim()) return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
    if (content.trim().length > 300) return NextResponse.json({ error: "300자 이내로 작성해주세요" }, { status: 400 });

    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("review_comments")
      .insert({ review_id: id, user_id: userId, content: content.trim() })
      .select("id, content, created_at, user_id, profiles(nickname, avatar_url)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comment: data });
  } catch (err) {
    console.error("[comments/post]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId, isAdmin } = body;

    const supabase = await createServerSupabase();

    // 운영자면 모든 리뷰 삭제, 아니면 본인 리뷰만
    let query = supabase.from("reviews").delete().eq("id", id);
    if (!isAdmin && userId) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[review/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { content, userId } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from("reviews")
      .update({ content: content.trim(), is_user_edited: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err) {
    console.error("[review/update]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
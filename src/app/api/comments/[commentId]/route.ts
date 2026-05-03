import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface Props {
  params: Promise<{ commentId: string }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { commentId } = await params;
    const { userId, isAdmin } = await req.json();

    if (!userId) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const supabase = await createServerSupabase();

    let query = supabase.from("review_comments").delete().eq("id", commentId);
    if (!isAdmin) query = query.eq("user_id", userId);

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[comments/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

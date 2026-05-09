import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { verifyAdmin, getAdminSupabaseClient } from "@/lib/adminAuth";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    const adminError = await verifyAdmin();
    const isAdmin = adminError === null;

    if (isAdmin) {
      const adminClient = getAdminSupabaseClient();
      const { error } = await adminClient.from("reviews").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.from("reviews").delete().eq("id", id).eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[review/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const { content, userId, isUserEdited } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const adminError = await verifyAdmin();
    const isAdmin = adminError === null;

    const updateData: Record<string, unknown> = { content: content.trim() };
    if (isUserEdited === true) updateData.is_user_edited = true;

    if (isAdmin) {
      const adminClient = getAdminSupabaseClient();
      const { data, error } = await adminClient
        .from("reviews")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, review: data });
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, review: data });
  } catch (err) {
    console.error("[review/update]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

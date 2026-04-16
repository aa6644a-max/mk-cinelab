import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = "aa6644a@gmail.com";

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("서버 설정 오류");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

// 신뢰 마크 토글
export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const { id } = await params;
    const { is_trusted } = await req.json();

    const adminClient = getAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ is_trusted })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/members/patch]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// 회원 강제 탈퇴
export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const { id } = await params;
    const adminClient = getAdminClient();

    // 리뷰 삭제
    await adminClient.from("reviews").delete().eq("user_id", id);
    // 프로필 삭제
    await adminClient.from("profiles").delete().eq("id", id);
    // auth 계정 삭제
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/members/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, nickname, gender, birth_date } = await req.json();

    if (!userId || !nickname || !gender || !birth_date) {
      return NextResponse.json({ error: "필드 누락" }, { status: 400 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 방금 생성된 유저인지 확인 (5분 이내)
    const { data: authUser } = await adminClient.auth.admin.getUserById(userId);
    if (!authUser?.user) {
      return NextResponse.json({ error: "사용자 없음" }, { status: 404 });
    }
    const createdAt = new Date(authUser.user.created_at);
    if (Date.now() - createdAt.getTime() > 5 * 60 * 1000) {
      return NextResponse.json({ error: "만료된 요청" }, { status: 400 });
    }

    // 프로필 생성 또는 gender/birth_date 보완
    const { data: existing } = await adminClient
      .from("profiles")
      .select("id, gender, birth_date")
      .eq("id", userId)
      .single();

    if (!existing) {
      await adminClient.from("profiles").insert({
        id: userId,
        nickname,
        gender,
        birth_date,
        avatar_url: null,
        is_trusted: false,
        review_count: 0,
      });
    } else {
      await adminClient
        .from("profiles")
        .update({ nickname, gender, birth_date })
        .eq("id", userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[create-profile]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, nickname, bio } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    if (!nickname?.trim() || nickname.trim().length < 2) {
      return NextResponse.json({ error: "닉네임은 2자 이상이어야 합니다" }, { status: 400 });
    }
    if (nickname.trim().length > 20) {
      return NextResponse.json({ error: "닉네임은 20자 이하여야 합니다" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    // 닉네임 중복 확인
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname.trim())
      .neq("id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 닉네임입니다" }, { status: 409 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ nickname: nickname.trim(), bio: bio?.trim() ?? null })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user/profile]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

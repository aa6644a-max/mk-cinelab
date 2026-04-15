import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "모든 항목을 입력해주세요" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "새 비밀번호는 6자 이상이어야 합니다" }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "현재 비밀번호와 동일합니다" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 현재 비밀번호 확인
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다" }, { status: 401 });
    }

    // 비밀번호 변경
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user/password]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

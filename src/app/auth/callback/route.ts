import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // 로그인 성공 시 서버에서 직접 guest 리뷰 연결
    if (data.user?.email) {
      try {
        await supabase.rpc("claim_guest_reviews", {
          p_user_id: data.user.id,
          p_email: data.user.email,
        });
        console.log("[callback] guest 리뷰 연결 시도:", data.user.email);
      } catch (err) {
        console.error("[callback] guest 리뷰 연결 실패:", err);
      }
    }
  }

  return NextResponse.redirect(`${origin}/mypage`);
}
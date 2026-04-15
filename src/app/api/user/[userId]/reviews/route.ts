import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createServerSupabase();

    const [profileRes, reviewsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, nickname, avatar_url, is_trusted, bio, review_count")
        .eq("id", userId)
        .single(),
      supabase
        .from("reviews")
        .select("id, movie_title, movie_poster, content, style, match_score, is_ai_assisted, is_user_edited, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.error || !profileRes.data) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({
      profile: profileRes.data,
      reviews: reviewsRes.data ?? [],
    });
  } catch (err) {
    console.error("[user/reviews]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

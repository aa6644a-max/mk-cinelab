import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 12;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const [profileRes, reviewsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, nickname, avatar_url, is_trusted, bio, review_count, total_xp, tier")
        .eq("id", userId)
        .single(),
      supabase
        .from("reviews")
        .select("id, movie_title, movie_poster, content, style, match_score, is_ai_assisted, is_user_edited, created_at", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to),
    ]);

    if (profileRes.error || !profileRes.data) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    const reviews = (reviewsRes.data ?? []).map((r: any) => ({
      ...r,
      content: r.content ? r.content.slice(0, 300) : "",
    }));

    return NextResponse.json(
      {
        profile: profileRes.data,
        reviews,
        total: reviewsRes.count ?? 0,
        page,
        pageSize: PAGE_SIZE,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[user/reviews]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

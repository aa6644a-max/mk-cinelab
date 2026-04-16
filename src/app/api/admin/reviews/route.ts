import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error, count } = await adminClient
      .from("reviews")
      .select(`
        id, movie_title, movie_poster, content, style, match_score,
        created_at, user_id,
        profiles (
          nickname
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reviews: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
  } catch (err) {
    console.error("[admin/reviews]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

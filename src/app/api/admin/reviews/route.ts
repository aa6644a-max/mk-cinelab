import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await adminClient
      .from("reviews")
      .select(`
        id, movie_title, movie_poster, content, style, match_score,
        created_at, user_id,
        profiles (
          nickname
        )
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reviews: data ?? [] });
  } catch (err) {
    console.error("[admin/reviews]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

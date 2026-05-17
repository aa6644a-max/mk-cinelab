import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  if (!title) return NextResponse.json({ reviews: [] });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await supabase
    .from("reviews")
    .select(`
      id, content, style, input_keywords,
      match_score, is_ai_assisted, is_user_edited,
      created_at,
      profiles ( nickname, avatar_url, is_trusted )
    `)
    .eq("movie_title", title)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ reviews: data ?? [] });
}

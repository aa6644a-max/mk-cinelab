import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const sort = searchParams.get("sort") ?? "latest";
    const search = searchParams.get("search") ?? "";
    const style = searchParams.get("style") ?? "";
    const badge = searchParams.get("badge") ?? "";
    const scoreMin = Number(searchParams.get("score_min") ?? "0");

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = await createServerSupabase();

    let query = supabase
      .from("reviews")
      .select(`
        id, movie_title, movie_poster, content, tmdb_id,
        input_keywords, style, is_ai_assisted, is_user_edited,
        guest_nickname, match_score, created_at,
        profiles (
          id, nickname, avatar_url, is_trusted
        )
      `, { count: "exact" });

    // 영화 제목 검색
    if (search.trim()) {
      query = query.ilike("movie_title", `%${search.trim()}%`);
    }

    // 스타일 필터
    if (style) {
      query = query.eq("style", style);
    }

    // 배지 필터
    if (badge === "ai") {
      query = query.eq("is_ai_assisted", true);
    } else if (badge === "edited") {
      query = query.eq("is_user_edited", true);
    }

    // 반영도 필터
    if (scoreMin > 0) {
      query = query.gte("match_score", scoreMin);
    }

    // 정렬
    query = query.order(sort === "score" ? "match_score" : "created_at", { ascending: false });

    // 페이지네이션
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[board]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 신뢰마크 필터는 profiles 조인 결과로 후처리
    let reviews = data ?? [];
    if (badge === "trusted") {
      reviews = reviews.filter((r: any) => r.profiles?.is_trusted === true);
    }

    return NextResponse.json({
      reviews,
      total: badge === "trusted" ? reviews.length : (count ?? 0),
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error("[board/route]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

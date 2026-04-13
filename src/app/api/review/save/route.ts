import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { searchMovieTMDB } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      movieTitle, moviePoster, userInput,
      inputKeywords, style, content, matchScore,
      guestNickname, guestEmail,
    } = body;

    // 비로그인 시 닉네임 필수
    if (!user && !guestNickname?.trim()) {
      return NextResponse.json({ error: "닉네임을 입력해주세요" }, { status: 400 });
    }

    // TMDB 포스터 + ID
    let finalPoster = moviePoster;
    let tmdbId = null;

    const tmdb = await searchMovieTMDB(movieTitle).catch(() => null);
    if (tmdb) {
      if (!finalPoster) {
        finalPoster = tmdb.poster_path
          ? "https://image.tmdb.org/t/p/w500" + tmdb.poster_path
          : null;
      }
      tmdbId = tmdb.id;
    }

    const insertData: any = {
      movie_title: movieTitle,
      movie_poster: finalPoster ?? null,
      tmdb_id: tmdbId,
      user_input: userInput,
      input_keywords: inputKeywords ?? [],
      style,
      content,
      match_score: matchScore,
      is_ai_assisted: true,
      is_user_edited: false,
    };

    if (user) {
      insertData.user_id = user.id;
    } else {
      insertData.user_id = null;
      insertData.guest_nickname = guestNickname.trim();
      insertData.guest_email = guestEmail?.trim() || null;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[review/save]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (user) {
      try {
        await supabase.rpc("increment_review_count", { user_id: user.id });
      } catch {}
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("[review/save] 전체 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { searchMovieTMDB } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      movieTitle, moviePoster, userInput,
      inputKeywords, style, content, matchScore,
      isUserEdited,
      guestNickname, guestEmail,
      userId,
    } = body;

    if (!userId && !guestNickname?.trim()) {
      return NextResponse.json({ error: "닉네임을 입력해주세요" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

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
      is_user_edited: isUserEdited ?? false,
    };

    if (userId) {
      insertData.user_id = userId;
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

    if (userId) {
      try {
        await supabase.rpc("increment_review_count", { user_id: userId });
      } catch {}
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("[review/save] 전체 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
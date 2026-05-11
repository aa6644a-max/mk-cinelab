import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  const authError = await verifyAdmin();
  if (authError) return authError;

  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, reason: "TMDB_API_KEY 환경변수 없음" });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/550?api_key=${key}&language=ko-KR`,
      { cache: "no-store" }
    );

    const body = await res.json().catch(() => null);

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      title: body?.title ?? null,
      error: body?.status_message ?? null,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: String(err) });
  }
}

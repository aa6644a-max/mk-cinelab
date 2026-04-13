import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  const url = new URL(req.url);
  // 캐시 없이 강제 새로고침으로 리다이렉트
  const response = NextResponse.redirect(new URL("/", url.origin));
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
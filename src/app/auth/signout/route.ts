import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  const url = new URL(req.url);

  const response = NextResponse.redirect(new URL("/", url.origin));
  
  // Supabase 쿠키 강제 삭제
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");
  response.cookies.delete(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`);
  response.headers.set("Cache-Control", "no-store");
  
  return response;
}
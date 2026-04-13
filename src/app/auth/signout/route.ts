import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  const url = new URL(req.url);

  // signout=true 파라미터 붙여서 리다이렉트
  const response = NextResponse.redirect(new URL("/?signout=true", url.origin));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
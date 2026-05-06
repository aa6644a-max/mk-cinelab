import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "aa6644a@gmail.com";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { announcement_text, announcement_enabled, adminEmail } = body;

    if (adminEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabase
      .from("site_settings")
      .update({
        announcement_text: announcement_text ?? null,
        announcement_enabled: announcement_enabled ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/site-settings]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

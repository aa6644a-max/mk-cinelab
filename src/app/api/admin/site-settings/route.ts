import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, getAdminSupabaseClient } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdmin();
  if (authError) return authError;

  try {
    const { announcement_text, announcement_enabled } = await req.json();

    const supabase = getAdminSupabaseClient();
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

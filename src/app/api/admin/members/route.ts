import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "aa6644a@gmail.com";

export async function GET() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // auth.users 전체 조회
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // profiles 전체 조회
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, nickname, birth_date, gender, review_count, is_trusted, created_at");
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const members = usersData.users
      .filter((u) => u.email !== ADMIN_EMAIL)
      .map((u) => {
        const profile = profileMap.get(u.id) as any;
        return {
          id: u.id,
          email: u.email,
          nickname: profile?.nickname ?? u.user_metadata?.name ?? "—",
          birth_date: profile?.birth_date ?? null,
          gender: profile?.gender ?? null,
          review_count: profile?.review_count ?? 0,
          is_trusted: profile?.is_trusted ?? false,
          joined_at: u.created_at,
        };
      })
      .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());

    return NextResponse.json({ members });
  } catch (err) {
    console.error("[admin/members]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

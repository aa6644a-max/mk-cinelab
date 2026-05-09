import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
      auth: { storageKey: "mk-cinelab-auth" },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, gender, birth_date } = user.user_metadata ?? {};

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: existing } = await adminClient
    .from("profiles")
    .select("id, gender, birth_date")
    .eq("id", user.id)
    .single();

  if (!existing) {
    await adminClient.from("profiles").insert({
      id: user.id,
      nickname: name ?? "유저",
      avatar_url: null,
      is_trusted: false,
      review_count: 0,
      gender: gender ?? null,
      birth_date: birth_date ?? null,
    });
  } else if (!existing.gender && !existing.birth_date && (gender || birth_date)) {
    await adminClient
      .from("profiles")
      .update({ gender: gender ?? null, birth_date: birth_date ?? null })
      .eq("id", user.id);
  }

  return NextResponse.json({ success: true });
}

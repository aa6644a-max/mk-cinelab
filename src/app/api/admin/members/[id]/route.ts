import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, getAdminSupabaseClient } from "@/lib/adminAuth";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const authError = await verifyAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { is_trusted } = await req.json();

    const adminClient = getAdminSupabaseClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ is_trusted })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/members/patch]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const authError = await verifyAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const adminClient = getAdminSupabaseClient();

    await adminClient.from("reviews").delete().eq("user_id", id);
    await adminClient.from("profiles").delete().eq("id", id);
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/members/delete]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

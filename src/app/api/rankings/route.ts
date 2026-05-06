import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=일, 1=월 ...
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get("period") ?? "weekly";
    const userId = searchParams.get("userId") ?? null;

    const supabase = await createServerSupabase();

    if (period === "alltime") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url, total_xp, tier")
        .order("total_xp", { ascending: false })
        .limit(50);

      const rankings = (profiles ?? []).map((p: any, i: number) => ({
        rank: i + 1,
        user_id: p.id,
        nickname: p.nickname,
        avatar_url: p.avatar_url,
        tier: p.tier,
        xp: p.total_xp,
      }));

      let myRank = null;
      if (userId) {
        const inTop = rankings.find((r: any) => r.user_id === userId);
        if (inTop) {
          myRank = inTop;
        } else {
          const { data: me } = await supabase
            .from("profiles")
            .select("nickname, avatar_url, total_xp, tier")
            .eq("id", userId)
            .single();
          if (me) {
            const { count } = await supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .gt("total_xp", me.total_xp);
            myRank = {
              rank: (count ?? 0) + 1,
              user_id: userId,
              nickname: me.nickname,
              avatar_url: me.avatar_url,
              tier: me.tier,
              xp: me.total_xp,
            };
          }
        }
      }

      return NextResponse.json({ rankings, myRank });
    }

    // weekly / monthly
    const startDate = period === "monthly" ? getMonthStart() : getWeekStart();

    const { data: events } = await supabase
      .from("xp_events")
      .select("user_id, xp")
      .gte("created_at", startDate.toISOString());

    const xpMap: Record<string, number> = {};
    for (const e of events ?? []) {
      xpMap[e.user_id] = (xpMap[e.user_id] ?? 0) + e.xp;
    }

    const sorted = Object.entries(xpMap).sort(([, a], [, b]) => b - a);
    const top50 = sorted.slice(0, 50);
    const top50Ids = top50.map(([id]) => id);

    let profileMap: Record<string, any> = {};
    if (top50Ids.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url, tier")
        .in("id", top50Ids);
      for (const p of profilesData ?? []) {
        profileMap[p.id] = p;
      }
    }

    const rankings = top50.map(([uid, xp], i) => ({
      rank: i + 1,
      user_id: uid,
      nickname: profileMap[uid]?.nickname ?? "알 수 없음",
      avatar_url: profileMap[uid]?.avatar_url ?? null,
      tier: profileMap[uid]?.tier ?? "rookie",
      xp,
    }));

    let myRank = null;
    if (userId) {
      const myXp = xpMap[userId];
      const inTop = rankings.find((r: any) => r.user_id === userId);
      if (inTop) {
        myRank = inTop;
      } else if (myXp !== undefined) {
        const myPos = sorted.findIndex(([id]) => id === userId);
        const { data: me } = await supabase
          .from("profiles")
          .select("nickname, avatar_url, tier")
          .eq("id", userId)
          .single();
        myRank = {
          rank: myPos + 1,
          user_id: userId,
          nickname: me?.nickname ?? "알 수 없음",
          avatar_url: me?.avatar_url ?? null,
          tier: me?.tier ?? "rookie",
          xp: myXp,
        };
      }
    }

    return NextResponse.json({ rankings, myRank });
  } catch (err) {
    console.error("[rankings]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

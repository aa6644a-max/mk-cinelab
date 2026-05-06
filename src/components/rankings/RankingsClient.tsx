"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "weekly" | "monthly" | "alltime";

interface RankEntry {
  rank: number;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  tier: string;
  xp: number;
}

const TIER_LABELS: Record<string, string> = {
  rookie: "루키",
  cinephile: "시네필",
  curator: "큐레이터",
  critic: "비평가",
  maestro: "마에스트로",
  legend: "레전드",
};

const TIER_STYLES: Record<string, string> = {
  rookie: "text-gray-400 border-gray-700",
  cinephile: "text-blue-400 border-blue-800",
  curator: "text-purple-400 border-purple-800",
  critic: "text-red-400 border-red-800",
  maestro: "text-yellow-400 border-yellow-700",
  legend: "text-amber-300 border-amber-500",
};

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "주간",
  monthly: "월간",
  alltime: "전체",
};

const RANK_STYLES = [
  { bg: "bg-yellow-950/40", border: "border-yellow-700/50", num: "text-yellow-400 font-black", icon: "🥇" },
  { bg: "bg-gray-800/40", border: "border-gray-600/50", num: "text-gray-300 font-black", icon: "🥈" },
  { bg: "bg-amber-950/40", border: "border-amber-800/50", num: "text-amber-600 font-black", icon: "🥉" },
];

function Avatar({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0 flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name[0] ?? "?").toUpperCase()}
    </div>
  );
}

function RankRow({ entry, isMe }: { entry: RankEntry; isMe: boolean }) {
  const isTop3 = entry.rank <= 3;
  const style = isTop3 ? RANK_STYLES[entry.rank - 1] : null;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
      isTop3 ? `${style!.bg} ${style!.border}` : "bg-gray-900/40 border-gray-800",
      isMe && !isTop3 && "border-red-900/60 bg-red-950/20"
    )}>
      <div className="w-8 text-center flex-shrink-0">
        {isTop3 ? (
          <span className="text-lg">{style!.icon}</span>
        ) : (
          <span className="text-sm text-gray-500 font-medium">{entry.rank}</span>
        )}
      </div>
      <Avatar src={entry.avatar_url} name={entry.nickname} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium truncate", isTop3 ? "text-white" : "text-gray-300", isMe && "text-red-400")}>
            {entry.nickname}
          </span>
          {isMe && <span className="text-[10px] text-red-500 flex-shrink-0">나</span>}
        </div>
        <span className={cn(
          "text-[10px] border px-1.5 py-0.5 rounded-full",
          TIER_STYLES[entry.tier] ?? TIER_STYLES.rookie
        )}>
          {TIER_LABELS[entry.tier] ?? entry.tier}
        </span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-sm font-bold", isTop3 ? "text-white" : "text-gray-300")}>
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-[10px] text-gray-600">XP</p>
      </div>
    </div>
  );
}

export default function RankingsClient() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("weekly");
  const [rankings, setRankings] = useState<RankEntry[]>([]);
  const [myRank, setMyRank] = useState<RankEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const userId = user?.id ?? "";
    fetch(`/api/rankings?period=${period}${userId ? `&userId=${userId}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setRankings(data.rankings ?? []);
        setMyRank(data.myRank ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period, user?.id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h1 className="text-lg font-black text-white">랭킹</h1>
      </div>

      {/* 기간 탭 */}
      <div className="flex gap-2 mb-6">
        {(["weekly", "monthly", "alltime"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              period === p ? "bg-white text-black" : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500"
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* 랭킹 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500">아직 이 기간의 데이터가 없습니다</p>
          <p className="text-xs text-gray-600 mt-1">리뷰를 작성하면 XP가 적립됩니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.map((entry) => (
            <RankRow
              key={entry.user_id}
              entry={entry}
              isMe={entry.user_id === user?.id}
            />
          ))}
        </div>
      )}

      {/* 내 순위 고정 (top 50 밖일 때만) */}
      {user && myRank && !rankings.find((r) => r.user_id === user.id) && (
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 mb-2 text-center">내 순위</p>
          <RankRow entry={myRank} isMe />
        </div>
      )}

      {/* 비로그인 안내 */}
      {!user && (
        <p className="text-center text-xs text-gray-600 mt-6">
          로그인하면 내 순위를 확인할 수 있습니다
        </p>
      )}
    </div>
  );
}

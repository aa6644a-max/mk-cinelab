"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Users, ShieldCheck, Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "aa6644a@gmail.com";

const GENDER_LABELS: Record<string, string> = {
  male: "남성",
  female: "여성",
};

interface Member {
  id: string;
  email: string;
  nickname: string;
  birth_date: string | null;
  gender: string | null;
  review_count: number;
  is_trusted: boolean;
  joined_at: string;
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age + "세";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized) return;
    if (!user || user.email !== ADMIN_EMAIL) {
      router.replace("/");
      return;
    }
    fetch("/api/admin/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setMembers(data.members);
      })
      .catch(() => setError("데이터를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [user, initialized, router]);

  if (!initialized || (user?.email === ADMIN_EMAIL && loading)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-3">
        <div className="h-10 bg-gray-900 rounded-xl animate-pulse w-48" />
        <div className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  // 통계
  const totalMale = members.filter((m) => m.gender === "male").length;
  const totalFemale = members.filter((m) => m.gender === "female").length;
  const noGender = members.filter((m) => !m.gender).length;

  const ageGroups: Record<string, number> = {};
  members.forEach((m) => {
    if (!m.birth_date) { ageGroups["미기재"] = (ageGroups["미기재"] ?? 0) + 1; return; }
    const birth = new Date(m.birth_date);
    const age = new Date().getFullYear() - birth.getFullYear();
    const group = Math.floor(age / 10) * 10;
    const label = group >= 60 ? "60대 이상" : `${group}대`;
    ageGroups[label] = (ageGroups[label] ?? 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-white">회원 관리</h1>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
          총 {members.length}명
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg mb-4">{error}</p>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="전체 회원" value={members.length + "명"} icon={<Users className="w-4 h-4" />} />
        <StatCard label="성별 분포" value={`남 ${totalMale} / 여 ${totalFemale}${noGender > 0 ? ` / 미기재 ${noGender}` : ""}`} small />
        <StatCard
          label="연령 분포"
          value={Object.entries(ageGroups).sort().map(([k, v]) => `${k} ${v}명`).join(" · ")}
          small
        />
        <StatCard
          label="신뢰 마크"
          value={members.filter((m) => m.is_trusted).length + "명"}
          icon={<ShieldCheck className="w-4 h-4 text-teal-400" />}
        />
      </div>

      {/* 회원 테이블 */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">닉네임</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">이메일</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">성별</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">나이</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">생년월일</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium text-right">
                  <Film className="w-3.5 h-3.5 inline" />
                </th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">가입일</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <tr
                  key={member.id}
                  className={`border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-900/20"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-medium">{member.nickname}</span>
                      {member.is_trusted && (
                        <ShieldCheck className="w-3 h-3 text-teal-400 flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{member.email}</td>
                  <td className="px-4 py-3">
                    {member.gender ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        member.gender === "male"
                          ? "border-blue-800 text-blue-400"
                          : "border-pink-800 text-pink-400"
                      }`}>
                        {GENDER_LABELS[member.gender]}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">미기재</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{calcAge(member.birth_date)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {member.birth_date ? formatDate(member.birth_date) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm text-right">{member.review_count}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(member.joined_at)}</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-600 text-sm">
                    가입된 회원이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  small,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
      <p className={`font-bold text-white leading-snug ${small ? "text-xs" : "text-xl"}`}>{value}</p>
    </div>
  );
}

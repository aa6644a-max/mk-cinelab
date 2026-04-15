"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, User, Lock, Mail, Calendar, Trash2,
  ChevronRight, CheckCircle, Eye, EyeOff, AlertTriangle
} from "lucide-react";

type Section = "main" | "profile" | "password" | "delete";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const [section, setSection] = useState<Section>("main");
  const [profile, setProfile] = useState<{ nickname: string; bio: string | null } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    supabase
      .from("profiles")
      .select("nickname, bio")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user, initialized, router]);

  if (!initialized || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-3">
        <div className="h-12 bg-gray-900 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {section === "main" && (
        <MainSection
          user={user}
          profile={profile}
          onNavigate={setSection}
        />
      )}
      {section === "profile" && (
        <ProfileSection
          user={user}
          profile={profile}
          onBack={() => setSection("main")}
          onSaved={(updated) => { setProfile(updated); setSection("main"); }}
        />
      )}
      {section === "password" && (
        <PasswordSection
          user={user}
          onBack={() => setSection("main")}
        />
      )}
      {section === "delete" && (
        <DeleteSection
          user={user}
          onBack={() => setSection("main")}
        />
      )}
    </div>
  );
}

// ── Main menu ────────────────────────────────────────────────────────────────

function MainSection({
  user,
  profile,
  onNavigate,
}: {
  user: any;
  profile: { nickname: string; bio: string | null } | null;
  onNavigate: (s: Section) => void;
}) {
  const nickname = profile?.nickname ?? user.user_metadata?.name ?? "익명";
  const joinedAt = user.created_at ? formatDate(user.created_at) : "—";

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mypage" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-white">계정 설정</h1>
      </div>

      {/* Account info card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-4 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">계정 정보</h2>
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-600">연동 이메일</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-600">가입일</p>
            <p className="text-sm text-white">{joinedAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-600">닉네임</p>
            <p className="text-sm text-white">{nickname}</p>
          </div>
        </div>
        {profile?.bio && (
          <div className="pl-7">
            <p className="text-[10px] text-gray-600 mb-0.5">한줄 소개</p>
            <p className="text-sm text-gray-400">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Settings items */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden mb-4">
        <SettingsItem
          icon={<User className="w-4 h-4" />}
          label="프로필 수정"
          description="닉네임, 한줄 소개 변경"
          onClick={() => onNavigate("profile")}
        />
        <div className="h-px bg-gray-800 mx-4" />
        <SettingsItem
          icon={<Lock className="w-4 h-4" />}
          label="비밀번호 변경"
          onClick={() => onNavigate("password")}
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <SettingsItem
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
          label="회원 탈퇴"
          labelClass="text-red-400"
          onClick={() => onNavigate("delete")}
        />
      </div>
    </>
  );
}

function SettingsItem({
  icon,
  label,
  description,
  labelClass,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  labelClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800/50 transition-colors text-left"
    >
      <span className="text-gray-400">{icon}</span>
      <div className="flex-1">
        <p className={cn("text-sm font-medium text-white", labelClass)}>{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </button>
  );
}

// ── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({
  user,
  profile,
  onBack,
  onSaved,
}: {
  user: any;
  profile: { nickname: string; bio: string | null } | null;
  onBack: () => void;
  onSaved: (updated: { nickname: string; bio: string | null }) => void;
}) {
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!nickname.trim() || nickname.trim().length < 2) {
      setError("닉네임은 2자 이상이어야 합니다");
      return;
    }
    if (nickname.trim().length > 20) {
      setError("닉네임은 20자 이하여야 합니다");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, nickname: nickname.trim(), bio: bio.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장 실패");
        return;
      }
      // auth 메타데이터 갱신 → 네비바 즉시 반영
      await supabase.auth.refreshSession();
      setSuccess(true);
      setTimeout(() => onSaved({ nickname: nickname.trim(), bio: bio.trim() || null }), 800);
    } catch {
      setError("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">프로필 수정</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">닉네임 <span className="text-gray-600">(2~20자)</span></label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">
            한줄 소개 <span className="text-gray-600">(선택, 최대 80자)</span>
          </label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={80}
            placeholder="나를 한 문장으로 소개해보세요"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-950/30 border border-green-900 px-3 py-2 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5" /> 저장되었습니다
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isLoading || success}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm transition-all",
            isLoading || success ? "bg-gray-700 text-gray-500 cursor-wait" : "bg-red-600 hover:bg-red-500 text-white"
          )}
        >
          {isLoading ? "저장 중..." : success ? "저장됨" : "저장하기"}
        </button>
      </div>
    </>
  );
}

// ── Password section ─────────────────────────────────────────────────────────

function PasswordSection({ user, onBack }: { user: any; onBack: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("모든 항목을 입력해주세요");
      return;
    }
    if (newPassword.length < 6) {
      setError("새 비밀번호는 6자 이상이어야 합니다");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }
    if (currentPassword === newPassword) {
      setError("현재 비밀번호와 동일합니다");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "변경 실패");
        return;
      }
      setSuccess(true);
    } catch {
      setError("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">비밀번호 변경</h1>
        </div>
        <div className="text-center space-y-4 py-10">
          <div className="w-14 h-14 bg-green-950/50 border border-green-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-white font-medium">비밀번호가 변경되었습니다</p>
          <button onClick={onBack} className="text-sm text-red-500 hover:text-red-400 transition-colors">
            돌아가기
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">비밀번호 변경</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="현재 비밀번호"
          value={currentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
          onChange={(v) => setCurrentPassword(v)}
        />
        <PasswordInput
          label="새 비밀번호"
          value={newPassword}
          show={showNew}
          placeholder="6자 이상"
          onToggle={() => setShowNew(!showNew)}
          onChange={(v) => setNewPassword(v)}
        />
        <PasswordInput
          label="새 비밀번호 확인"
          value={confirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
          onChange={(v) => setConfirmPassword(v)}
        />

        {error && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm transition-all",
            isLoading ? "bg-gray-700 text-gray-500 cursor-wait" : "bg-red-600 hover:bg-red-500 text-white"
          )}
        >
          {isLoading ? "변경 중..." : "비밀번호 변경"}
        </button>

        <div className="text-center">
          <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            현재 비밀번호를 모르시나요?
          </Link>
        </div>
      </form>
    </>
  );
}

function PasswordInput({
  label,
  value,
  show,
  placeholder,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  placeholder?: string;
  onToggle: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "비밀번호 입력"}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Delete section ───────────────────────────────────────────────────────────

function DeleteSection({ user, onBack }: { user: any; onBack: () => void }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "탈퇴") {
      setError("'탈퇴'를 정확히 입력해주세요");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "탈퇴 실패");
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      setError("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">회원 탈퇴</h1>
      </div>

      <div className="bg-red-950/20 border border-red-900 rounded-2xl p-5 mb-6 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-400">탈퇴 전 꼭 확인해주세요</p>
            <ul className="text-xs text-red-400/70 space-y-1 list-disc list-inside">
              <li>작성한 모든 리뷰가 삭제됩니다</li>
              <li>프로필 및 계정 정보가 삭제됩니다</li>
              <li>삭제된 데이터는 복구할 수 없습니다</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">
            계속하려면 아래에 <span className="text-red-400 font-bold">탈퇴</span>를 입력하세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="탈퇴"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={isLoading || confirmText !== "탈퇴"}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm transition-all",
            isLoading || confirmText !== "탈퇴"
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-red-700 hover:bg-red-600 text-white"
          )}
        >
          {isLoading ? "처리 중..." : "회원 탈퇴"}
        </button>
      </div>
    </>
  );
}

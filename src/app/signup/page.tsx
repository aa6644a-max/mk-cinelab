"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !nickname.trim()) {
      setError("모든 항목을 입력해주세요");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    if (nickname.length < 2) {
      setError("닉네임은 2자 이상이어야 합니다");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: nickname.trim() },
        },
      });

      if (signupError) {
        if (signupError.message.includes("already registered")) {
          setError("이미 사용 중인 이메일입니다");
        } else {
          setError(signupError.message);
        }
        return;
      }

      if (data.user) {
        // profiles 테이블에 닉네임 업데이트
        const { error: profileError } = await supabase
  .from("profiles")
  .upsert({
    id: data.user.id,
    nickname: nickname.trim(),
    avatar_url: null,
    is_trusted: false,
    review_count: 0,
  });

if (profileError) {
  console.error("프로필 생성 오류:", profileError);
}

router.push("/");
router.refresh();
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-xl tracking-tight">
            MK <span className="text-red-500">CINELAB</span>
          </Link>
          <h1 className="text-lg font-bold text-white mt-4 mb-1">회원가입</h1>
          <p className="text-sm text-gray-500">나만의 영화 취향 지도를 만들어보세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="게시판에 표시될 이름"
              maxLength={20}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm transition-all",
              isLoading
                ? "bg-gray-700 text-gray-500 cursor-wait"
                : "bg-red-600 hover:bg-red-500 text-white"
            )}
          >
            {isLoading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-red-500 hover:text-red-400">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
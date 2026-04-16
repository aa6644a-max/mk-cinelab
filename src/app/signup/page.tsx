"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1939 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDays(year: number, month: number) {
  if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
  return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [genderError, setGenderError] = useState(false);

  const days = getDays(Number(birthYear), Number(birthMonth));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !nickname.trim()) {
      setError("닉네임, 이메일, 비밀번호를 입력해주세요");
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
    if (!gender) {
      setGenderError(true);
      setError("성별을 선택해주세요");
      return;
    }
    setGenderError(false);
    if (!birthYear || !birthMonth || !birthDay) {
      setError("생년월일을 선택해주세요");
      return;
    }

    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

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
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            nickname: nickname.trim(),
            avatar_url: null,
            is_trusted: false,
            review_count: 0,
            gender,
            birth_date: birthDate,
          });

        if (profileError) {
          console.error("프로필 생성 오류:", profileError);
        }

        window.location.href = "/";
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      setError("회원가입 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-xl tracking-tight">
            MK <span className="text-red-500">CINELAB</span>
          </Link>
          <h1 className="text-lg font-bold text-white mt-4 mb-1">회원가입</h1>
          <p className="text-sm text-gray-500">나만의 영화 취향 지도를 만들어보세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* 닉네임 */}
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

          {/* 이메일 */}
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

          {/* 비밀번호 */}
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

          {/* 성별 */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[
                { value: "male", label: "남성" },
                { value: "female", label: "여성" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setGender(value); setGenderError(false); }}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    gender === value
                      ? "bg-red-600 border-red-600 text-white"
                      : genderError
                      ? "bg-gray-900 border-red-700 text-gray-400"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {genderError && (
              <p className="text-xs text-red-400 mt-1.5">성별을 선택해주세요</p>
            )}
          </div>

          {/* 생년월일 */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">생년월일</label>
            <div className="flex gap-2">
              <select
                value={birthYear}
                onChange={(e) => { setBirthYear(e.target.value); setBirthDay(""); }}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="" disabled>년</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={birthMonth}
                onChange={(e) => { setBirthMonth(e.target.value); setBirthDay(""); }}
                className="w-20 bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="" disabled>월</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="w-20 bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="" disabled>일</option>
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Supabase exchanges the token from the URL hash automatically via PKCE
    // We just need to wait for the session to be established
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsReady(true);
      } else {
        setError("유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 시도해주세요.");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("새 비밀번호를 입력해주세요");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
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
          <h1 className="text-lg font-bold text-white mt-4 mb-1">새 비밀번호 설정</h1>
          <p className="text-sm text-gray-500">사용할 새 비밀번호를 입력해주세요</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-950/50 border border-green-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">비밀번호가 변경되었습니다</p>
              <p className="text-sm text-gray-500">새 비밀번호로 로그인할 수 있습니다</p>
            </div>
            <Link href="/login" className="block text-sm text-red-500 hover:text-red-400 transition-colors">
              로그인하러 가기
            </Link>
          </div>
        ) : !isReady && error ? (
          <div className="text-center space-y-4">
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 px-3 py-2 rounded-lg">
              {error}
            </p>
            <Link href="/forgot-password" className="block text-sm text-red-500 hover:text-red-400 transition-colors">
              비밀번호 찾기 다시 시도
            </Link>
          </div>
        ) : isReady ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">새 비밀번호</label>
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

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">비밀번호 확인</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                isLoading ? "bg-gray-700 text-gray-500 cursor-wait" : "bg-red-600 hover:bg-red-500 text-white"
              )}
            >
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        ) : (
          <div className="text-center text-gray-500 text-sm">링크 확인 중...</div>
        )}
      </div>
    </div>
  );
}

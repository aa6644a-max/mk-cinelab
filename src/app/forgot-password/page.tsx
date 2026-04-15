"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("이메일을 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
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
          <h1 className="text-lg font-bold text-white mt-4 mb-1">비밀번호 찾기</h1>
          <p className="text-sm text-gray-500">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-950/50 border border-green-800 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">이메일을 확인해주세요</p>
              <p className="text-sm text-gray-500">
                <span className="text-gray-300">{email}</span>로<br />
                비밀번호 재설정 링크를 발송했습니다
              </p>
            </div>
            <p className="text-xs text-gray-600">메일이 오지 않으면 스팸함을 확인해주세요</p>
            <Link href="/login" className="block text-sm text-red-500 hover:text-red-400 transition-colors">
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">가입한 이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors text-sm"
              />
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
              {isLoading ? "전송 중..." : "재설정 링크 보내기"}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 로그인으로 돌아가기
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

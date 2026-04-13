"use client";

import { useAuth } from "@/hooks/useAuth";

export default function LoginButtonClient() {
  const { signInWithGoogle } = useAuth();
  return (
    <button
      onClick={signInWithGoogle}
      className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"
    >
      Google로 로그인하기
    </button>
  );
}
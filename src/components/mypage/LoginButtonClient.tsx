"use client";

import Link from "next/link";

export default function LoginButtonClient() {
  return (
    <Link href="/login">
      <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
        로그인하기
      </button>
    </Link>
  );
}
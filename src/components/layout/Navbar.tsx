"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import SearchBar from "@/components/layout/SearchBar";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "대시보드", href: "/" },
  { label: "AI 취향 큐레이션", href: "/recommend" },
  { label: "AI 비평실", href: "/review-lab" },
  { label: "리뷰 보드", href: "/board" },
  { label: "마이페이지", href: "/mypage" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg tracking-tight flex-shrink-0">
          MK <span className="text-red-500">CINELAB</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors whitespace-nowrap",
                pathname === item.href
                  ? "text-white font-medium"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 데스크탑 우측 */}
        <div className="hidden md:flex items-center gap-3">
          <SearchBar />
          {user ? (
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url ? (
                <Image src={user.user_metadata.avatar_url} alt="프로필" width={28} height={28} className="rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                  {(user.user_metadata?.name ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-300">{user.user_metadata?.name ?? user.email}</span>
              <button onClick={signOut} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                로그아웃
              </button>
            </div>
          ) : loading ? (
            <div className="w-20 h-8 bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-sm border border-gray-700 px-4 py-1.5 rounded-lg text-gray-300 hover:border-gray-500 transition-colors whitespace-nowrap"
            >
              Google 로그인
            </button>
          )}
        </div>

        {/* 모바일 우측 */}
        <div className="flex md:hidden items-center gap-3">
          <SearchBar />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black/95">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 모바일 로그인 */}
          <div className="px-4 pb-4 border-t border-gray-800 pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <Image src={user.user_metadata.avatar_url} alt="프로필" width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                      {(user.user_metadata?.name ?? user.email ?? "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-300">{user.user_metadata?.name ?? user.email}</span>
                </div>
                <button onClick={signOut} className="text-xs text-gray-500 hover:text-gray-300">
                  로그아웃
                </button>
              </div>
            ) : loading ? (
              <div className="h-9 bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <button
                onClick={() => { signInWithGoogle(); setMenuOpen(false); }}
                className="w-full py-2.5 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-500 transition-colors"
              >
                Google 로그인
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
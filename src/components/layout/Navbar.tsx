"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import SearchBar from "@/components/layout/SearchBar";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";

const navItems = [
  { label: "대시보드", href: "/" },
  { label: "AI 취향 큐레이션", href: "/recommend" },
  { label: "AI 비평실", href: "/review-lab" },
  { label: "리뷰 보드", href: "/board" },
  { label: "마이페이지", href: "/mypage" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg tracking-tight flex-shrink-0">
          MK <span className="text-red-500">CINELAB</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={cn("text-sm transition-colors whitespace-nowrap",
                pathname === item.href ? "text-white font-medium" : "text-gray-400 hover:text-gray-200"
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
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {(user.user_metadata?.name ?? user.email ?? "U")[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 max-w-[120px] truncate hidden lg:block">
                  {user.user_metadata?.name ?? user.email}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-gray-500 transition-transform", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-xs text-gray-500 mb-0.5">로그인 중</p>
                    <p className="text-sm text-white font-medium truncate">{user.user_metadata?.name ?? user.email}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                  <Link href="/mypage" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" />마이페이지
                  </Link>
                  <div className="border-t border-gray-800">
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login"
              className="text-sm border border-gray-700 px-4 py-1.5 rounded-lg text-gray-300 hover:border-gray-500 transition-colors whitespace-nowrap"
            >
              로그인
            </Link>
          )}
        </div>

        {/* 모바일 우측 */}
        <div className="flex md:hidden items-center gap-3">
          <SearchBar />
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black/95">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className={cn("block px-3 py-2.5 rounded-lg text-sm transition-colors",
                  pathname === item.href ? "bg-gray-900 text-white font-medium" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="px-4 pb-4 border-t border-gray-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                    {(user.user_metadata?.name ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{user.user_metadata?.name ?? "사용자"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-900 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="w-full block text-center py-2.5 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-500 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
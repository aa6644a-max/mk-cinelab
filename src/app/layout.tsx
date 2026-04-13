import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MK CINELAB — 신뢰할 수 있는 영화 플랫폼",
  description: "실시간 박스오피스, AI 취향 큐레이션, 전문가 리뷰",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={cn(inter.className, "bg-black text-white min-h-screen")}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
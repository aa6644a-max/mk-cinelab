import { Metadata } from "next";
import Link from "next/link";
import { Film, Sparkles, BarChart2, Users, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 소개 — MK CINELAB",
  description: "MK CINELAB은 AI 기반 영화 리뷰 플랫폼입니다.",
};

const features = [
  {
    icon: BarChart2,
    title: "실시간 박스오피스",
    desc: "영화진흥위원회 데이터 기반으로 매일 업데이트되는 박스오피스 순위를 확인할 수 있습니다.",
  },
  {
    icon: Sparkles,
    title: "AI 비평실",
    desc: "내 감상과 감정 키워드를 입력하면 AI가 평론가 모드, 감성 모드, 블로그 모드, SNS 모드 등 원하는 문체로 리뷰를 작성해드립니다.",
  },
  {
    icon: Film,
    title: "영화 상세 정보",
    desc: "TMDB 데이터베이스 기반으로 영화의 줄거리, 출연진, 감독, 평점, 비슷한 영화 등 다양한 정보를 제공합니다.",
  },
  {
    icon: Users,
    title: "리뷰 커뮤니티",
    desc: "회원들이 작성한 리뷰를 공유하고, 다양한 시각의 영화 감상을 나눌 수 있는 공간입니다.",
  },
  {
    icon: Star,
    title: "AI 취향 큐레이션",
    desc: "취향에 맞는 영화를 AI가 분석하여 맞춤 추천해드립니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">About</p>
        <h1 className="text-3xl font-black text-white mb-4">
          MK <span className="text-red-500">CINELAB</span>
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          영화를 더 깊이, 더 풍부하게 즐기기 위한 공간입니다.<br />
          AI 기술과 영화 데이터를 결합해 나만의 영화 기록을 만들어가세요.
        </p>
      </div>

      {/* 서비스 소개 */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-base font-bold text-white mb-3">MK CINELAB이란?</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          MK CINELAB은 영화를 사랑하는 사람들을 위한 AI 기반 영화 리뷰 플랫폼입니다.
          단순히 평점을 남기는 것을 넘어, 내가 느낀 감정과 생각을 전문적인 문체로 표현할 수 있도록 도와줍니다.
          실시간 박스오피스부터 AI 취향 큐레이션까지, 영화와 관련된 모든 것을 한 곳에서 경험해보세요.
        </p>
      </div>

      {/* 주요 기능 */}
      <h2 className="text-base font-bold text-white mb-4">주요 기능</h2>
      <div className="space-y-3 mb-10">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex gap-4 p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 운영 정보 */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 mb-8 text-sm text-gray-500 space-y-2">
        <div className="flex gap-3">
          <span className="text-gray-600 w-20 flex-shrink-0">운영자</span>
          <span className="text-gray-400">MK</span>
        </div>
        <div className="flex gap-3">
          <span className="text-gray-600 w-20 flex-shrink-0">문의</span>
          <a href="mailto:aa6644a@gmail.com" className="text-red-400 hover:text-red-300 transition-colors">aa6644a@gmail.com</a>
        </div>
        <div className="flex gap-3">
          <span className="text-gray-600 w-20 flex-shrink-0">데이터</span>
          <span className="text-gray-400">TMDB · 영화진흥위원회</span>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-600 justify-center">
        <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-gray-400 transition-colors">문의하기</Link>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "문의하기 — MK CINELAB",
  description: "MK CINELAB 서비스 문의",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">Contact</p>
        <h1 className="text-2xl font-black text-white mb-3">문의하기</h1>
        <p className="text-sm text-gray-400">
          서비스 이용 중 불편하신 점이나 개선 제안이 있으시면 편하게 연락 주세요.
        </p>
      </div>

      {/* 이메일 문의 */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center">
            <Mail className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">이메일 문의</p>
            <p className="text-xs text-gray-500">가장 빠르게 답변 받을 수 있는 방법입니다</p>
          </div>
        </div>
        <a
          href="mailto:aa6644a@gmail.com?subject=[MK CINELAB] 문의합니다"
          className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Mail className="w-4 h-4" />
          aa6644a@gmail.com 으로 문의하기
        </a>
      </div>

      {/* 문의 유형 안내 */}
      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-bold text-white">이런 내용을 보내주세요</h2>
        {[
          {
            icon: MessageSquare,
            title: "서비스 오류 / 버그 신고",
            desc: "어떤 페이지에서, 어떤 상황에서 문제가 발생했는지 알려주시면 빠르게 수정하겠습니다.",
          },
          {
            icon: MessageSquare,
            title: "기능 개선 제안",
            desc: "사용하시면서 불편하신 점이나 추가되었으면 하는 기능을 자유롭게 제안해주세요.",
          },
          {
            icon: MessageSquare,
            title: "리뷰 / 게시물 관련",
            desc: "부적절한 게시물 신고나 본인 게시물 삭제 요청은 이메일로 알려주세요.",
          },
          {
            icon: MessageSquare,
            title: "개인정보 관련 문의",
            desc: "개인정보 열람, 수정, 삭제 요청 등은 이메일로 문의해 주세요.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 p-4 bg-gray-900/40 border border-gray-800 rounded-xl">
              <Icon className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-300 mb-0.5">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 답변 시간 안내 */}
      <div className="flex items-start gap-3 p-4 bg-gray-900/40 border border-gray-800 rounded-xl mb-10">
        <Clock className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 leading-relaxed">
          문의 답변은 평일 기준 1~3일 내에 드립니다. 서비스 특성상 답변이 늦어질 수 있는 점 양해 부탁드립니다.
        </p>
      </div>

      <div className="flex gap-4 text-xs text-gray-600 justify-center">
        <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
        <span>·</span>
        <Link href="/about" className="hover:text-gray-400 transition-colors">서비스 소개</Link>
      </div>
    </div>
  );
}

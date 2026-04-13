import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CurationBanner() {
  return (
    <section>
      <div className="border border-gray-800 rounded-2xl p-6 bg-gradient-to-r from-gray-900 to-black hover:border-gray-700 transition-all group">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-500 tracking-widest mb-2 uppercase">
              AI 취향 큐레이션
            </p>
            <h3 className="text-xl font-bold text-white mb-2">
              오늘 어떤 무드의 영화가 당기시나요?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              6가지 질문으로 취향을 분석해 딱 3편을 골라드립니다
            </p>
            {/* 플로우 미리보기 */}
            <div className="flex items-center gap-2 flex-wrap">
              {["장르", "템포 / 무드", "키워드"].map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 border border-gray-700 px-2.5 py-1 rounded-full">
                    {step}
                  </span>
                  {i < 2 && <ArrowRight className="w-3 h-3 text-gray-600" />}
                </span>
              ))}
              <ArrowRight className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-red-400 border border-red-900 px-2.5 py-1 rounded-full bg-red-950/30">
                AI 추천 3편
              </span>
            </div>
          </div>

          <Link href="/recommend">
            <button className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] whitespace-nowrap">
              <Sparkles className="w-4 h-4" />
              시작하기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
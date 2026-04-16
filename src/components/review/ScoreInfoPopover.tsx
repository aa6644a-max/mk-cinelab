"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

export function ScoreInfoContent() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-white">감상 반영도란?</p>
      <p className="text-xs text-gray-400 leading-relaxed">
        AI가 당신의 감상이 리뷰에 얼마나 잘 녹아들었는지 채점한 점수입니다.
      </p>
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">채점 기준</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-xs flex-shrink-0 mt-0.5">40점</span>
            <span className="text-xs text-gray-400">핵심 감정·표현이 리뷰에 살아있는가</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-xs flex-shrink-0 mt-0.5">35점</span>
            <span className="text-xs text-gray-400">언급한 장면·요소가 반영됐는가</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-xs flex-shrink-0 mt-0.5">25점</span>
            <span className="text-xs text-gray-400">선택한 키워드의 뉘앙스가 녹아들었는가</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-3 space-y-1">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">점수 분포</p>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex justify-between"><span>65~75점</span><span>짧거나 일반적인 감상</span></div>
          <div className="flex justify-between"><span>76~85점</span><span>구체적인 감상 + 키워드</span></div>
          <div className="flex justify-between"><span>86점 이상</span><span>구체적이고 키워드도 풍부</span></div>
        </div>
      </div>
    </div>
  );
}

export function ScoreInfoPopover() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-600 hover:text-gray-300 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-6 left-0 z-20 w-72 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl">
            <ScoreInfoContent />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

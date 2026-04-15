import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 — MK CINELAB",
  description: "MK CINELAB 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-2xl font-black text-white mb-2">개인정보처리방침</h1>
        <p className="text-xs text-gray-600">최종 업데이트: 2026년 4월 15일</p>
      </div>

      <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-white mb-3">제1조 (개요)</h2>
          <p>
            MK CINELAB(이하 "서비스")은 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침은 서비스가 수집하는 개인정보의 종류, 이용 목적, 보관 기간 및 이용자의 권리에 대해 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제2조 (수집하는 개인정보)</h2>
          <p className="mb-3">서비스는 다음과 같은 개인정보를 수집합니다.</p>
          <div className="space-y-3">
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">소셜 로그인 시</p>
              <p className="text-gray-500 text-xs">이름, 이메일 주소, 프로필 사진 (Google 계정 정보)</p>
            </div>
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">서비스 이용 시</p>
              <p className="text-gray-500 text-xs">작성한 리뷰 내용, 선택한 감정 키워드, 영화 검색 기록</p>
            </div>
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">자동 수집 정보</p>
              <p className="text-gray-500 text-xs">접속 IP, 브라우저 정보, 방문 시간, 쿠키 및 서비스 이용 기록</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제3조 (개인정보 이용 목적)</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>회원 식별 및 계정 관리</li>
            <li>서비스 제공 및 개선</li>
            <li>리뷰 게시물 관리</li>
            <li>AI 리뷰 생성 서비스 제공</li>
            <li>서비스 이용 통계 분석</li>
            <li>광고 서비스 제공 (Google AdSense)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제4조 (개인정보 보관 기간)</h2>
          <p className="mb-2">
            회원 개인정보는 서비스 탈퇴 시까지 보관됩니다. 단, 관련 법령에 의해 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <p>비회원(게스트)이 작성한 리뷰는 별도 요청이 없는 한 서비스 내에 보관됩니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제5조 (제3자 서비스)</h2>
          <p className="mb-3">서비스는 다음 제3자 서비스를 이용합니다.</p>
          <div className="space-y-3">
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">Supabase</p>
              <p className="text-gray-500 text-xs">데이터베이스 및 인증 서비스. 개인정보 저장에 사용됩니다.</p>
            </div>
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">Google (OAuth / AdSense)</p>
              <p className="text-gray-500 text-xs">
                로그인 인증 및 광고 서비스에 사용됩니다. Google AdSense는 맞춤 광고를 위해 쿠키를 사용할 수 있습니다.
                자세한 내용은{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 transition-colors">
                  Google 개인정보처리방침
                </a>
                을 참고하세요.
              </p>
            </div>
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">TMDB (The Movie Database)</p>
              <p className="text-gray-500 text-xs">영화 정보 제공 API. 개인정보는 전달되지 않습니다.</p>
            </div>
            <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-1 text-xs">Anthropic (Claude AI)</p>
              <p className="text-gray-500 text-xs">AI 리뷰 생성에 사용됩니다. 입력한 감상 내용이 처리될 수 있습니다.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제6조 (쿠키 정책)</h2>
          <p className="mb-2">
            서비스는 이용자 경험 향상 및 광고 제공을 위해 쿠키를 사용합니다. 쿠키는 브라우저 설정에서 비활성화할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.
          </p>
          <p>
            Google AdSense를 통한 광고가 표시될 수 있으며, 이 과정에서 Google의 쿠키가 사용될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제7조 (이용자의 권리)</h2>
          <p className="mb-2">이용자는 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정 요청</li>
            <li>개인정보 삭제 요청 (회원 탈퇴)</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
          <p className="mt-2">
            권리 행사는{" "}
            <a href="mailto:aa6644a@gmail.com" className="text-red-400 hover:text-red-300 transition-colors">
              aa6644a@gmail.com
            </a>
            으로 문의해 주세요.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제8조 (개인정보 보호책임자)</h2>
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg space-y-1 text-xs">
            <p><span className="text-gray-600">책임자</span> <span className="text-gray-300 ml-3">MK</span></p>
            <p><span className="text-gray-600">이메일</span> <span className="text-gray-300 ml-3">aa6644a@gmail.com</span></p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제9조 (방침 변경)</h2>
          <p>
            본 개인정보처리방침은 법령 또는 서비스 변경에 따라 업데이트될 수 있습니다. 변경 시 서비스 내 공지사항을 통해 안내합니다.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-800 flex gap-4 text-xs text-gray-600">
        <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-gray-400 transition-colors">문의하기</Link>
        <span>·</span>
        <Link href="/" className="hover:text-gray-400 transition-colors">홈으로</Link>
      </div>
    </div>
  );
}

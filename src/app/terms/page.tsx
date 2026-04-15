import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 — MK CINELAB",
  description: "MK CINELAB 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-bold text-red-500 tracking-widest uppercase mb-3">Legal</p>
        <h1 className="text-2xl font-black text-white mb-2">이용약관</h1>
        <p className="text-xs text-gray-600">최종 업데이트: 2026년 4월 15일</p>
      </div>

      <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-white mb-3">제1조 (목적)</h2>
          <p>
            본 약관은 MK CINELAB(이하 "서비스")의 이용과 관련하여 서비스 운영자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제2조 (서비스 내용)</h2>
          <p className="mb-2">서비스는 다음과 같은 기능을 제공합니다.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>실시간 영화 박스오피스 정보 제공</li>
            <li>AI 기반 영화 리뷰 작성 지원</li>
            <li>영화 상세 정보 조회</li>
            <li>AI 취향 기반 영화 큐레이션</li>
            <li>사용자 리뷰 작성 및 공유</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제3조 (회원가입 및 계정)</h2>
          <p className="mb-2">
            서비스는 Google 소셜 로그인을 통한 회원가입을 지원합니다. 이용자는 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.
          </p>
          <p>
            계정 관리 책임은 이용자 본인에게 있으며, 제3자에 의한 무단 사용이 발생한 경우 즉시 운영자에게 통보해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제4조 (이용자의 의무)</h2>
          <p className="mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>타인의 명예를 훼손하거나 권리를 침해하는 행위</li>
            <li>음란하거나 폭력적인 내용을 게시하는 행위</li>
            <li>서비스 운영을 방해하는 행위</li>
            <li>저작권 등 지식재산권을 침해하는 행위</li>
            <li>스팸성 게시물을 반복적으로 등록하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제5조 (AI 생성 콘텐츠)</h2>
          <p>
            서비스 내 AI 비평실을 통해 생성된 리뷰는 AI가 보조하여 작성된 콘텐츠임을 명시합니다. 해당 콘텐츠의 정확성, 완전성에 대해 운영자는 보증하지 않으며, 이용자는 본인의 판단 하에 활용해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제6조 (게시물 관리)</h2>
          <p>
            이용자가 작성한 게시물의 저작권은 해당 이용자에게 귀속됩니다. 단, 운영자는 서비스 운영 및 홍보 목적으로 게시물을 활용할 수 있습니다. 이용약관에 위반되는 게시물은 운영자가 사전 통보 없이 삭제할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제7조 (서비스 변경 및 중단)</h2>
          <p>
            운영자는 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다. 현재 서비스는 베타 운영 중이며, 기능 변경 및 오류가 발생할 수 있음을 이용자는 인지하고 동의합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제8조 (면책조항)</h2>
          <p>
            운영자는 천재지변, 서비스 장애, 데이터 손실 등 불가항력적 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다. 또한 TMDB, 영화진흥위원회 등 외부 데이터 제공 기관의 정보 오류에 대한 책임은 해당 기관에 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-3">제9조 (문의)</h2>
          <p>
            이용약관에 관한 문의사항은{" "}
            <a href="mailto:aa6644a@gmail.com" className="text-red-400 hover:text-red-300 transition-colors">
              aa6644a@gmail.com
            </a>
            으로 연락 주시기 바랍니다.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-800 flex gap-4 text-xs text-gray-600">
        <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-gray-400 transition-colors">문의하기</Link>
        <span>·</span>
        <Link href="/" className="hover:text-gray-400 transition-colors">홈으로</Link>
      </div>
    </div>
  );
}

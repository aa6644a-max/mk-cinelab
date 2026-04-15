import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">
              MK <span className="text-red-500">CINELAB</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">영화를 더 깊이 즐기기 위한 공간</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600">
            <Link href="/about" className="hover:text-gray-400 transition-colors">서비스 소개</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors font-medium text-gray-500">개인정보처리방침</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">문의하기</Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-gray-700">
          <p>© 2026 MK CINELAB. All rights reserved.</p>
          <p>
            영화 데이터 제공:{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors">TMDB</a>
            {" · "}
            <a href="https://www.kobis.or.kr" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors">영화진흥위원회</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

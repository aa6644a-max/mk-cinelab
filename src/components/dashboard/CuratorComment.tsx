export default function CuratorComment() {
  // 나중에 Supabase에서 가져오도록 교체 예정
  const comment = {
    title: "이달의 주목작",
    movieTitle: "여기에 영화 제목",
    text: "운영자 MK가 직접 선정한 이달의 주목작입니다. 이 섹션은 Supabase에서 데이터를 불러와 관리자 페이지에서 수정할 수 있도록 연동할 예정입니다.",
    curator: "MK",
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">큐레이터 코멘트</h2>
        <span className="text-xs text-gray-500 border border-gray-700 px-2.5 py-1 rounded-full">
          MK 선정
        </span>
      </div>
      <div className="border border-gray-800 rounded-xl p-5 bg-gray-900/50">
        <p className="text-xs text-red-500 font-semibold tracking-widest mb-2 uppercase">
          {comment.title}
        </p>
        <h3 className="text-base font-bold text-white mb-3">{comment.movieTitle}</h3>
        <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-red-800 pl-3">
          {comment.text}
        </p>
        <p className="text-xs text-gray-600 mt-3">— {comment.curator}</p>
      </div>
    </section>
  );
}
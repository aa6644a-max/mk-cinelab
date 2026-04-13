import { createServerSupabase } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";
import { Film, Sparkles } from "lucide-react";

const STYLE_LABELS: Record<string, string> = {
  critic: "평론가 모드",
  emotional: "감성 모드",
  blog: "블로그 모드",
  sns: "SNS 모드",
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (day > 0) return day + "일 전";
  if (hour > 0) return hour + "시간 전";
  if (min > 0) return min + "분 전";
  return "방금 전";
}

export default async function LatestReviews() {
  const supabase = await createServerSupabase();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id, movie_title, movie_poster, content,
      style, is_ai_assisted, guest_nickname,
      match_score, created_at,
      profiles ( nickname, avatar_url )
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">최신 리뷰</h2>
        <Link
          href="/board"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="space-y-3">
        {reviews.map((review: any) => {
          const profile = review.profiles;
          const nickname = profile?.nickname ?? review.guest_nickname ?? "익명";

          return (
            <Link key={review.id} href={"/review/" + review.id} className="block">
              <div className="flex gap-0 bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all">
                {/* 포스터 */}
                <div className="w-14 flex-shrink-0 bg-gray-800 self-stretch">
                  {review.movie_poster ? (
                    <Image
                      src={review.movie_poster}
                      alt={review.movie_title}
                      width={56}
                      height={84}
                      className="w-full h-full object-cover"
                      style={{ minHeight: "84px" }}
                    />
                  ) : (
                    <div className="w-full min-h-[84px] flex items-center justify-center">
                      <Film className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="flex-1 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={nickname}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[9px] text-gray-400 flex-shrink-0">
                        {nickname[0]}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{nickname}</span>
                    {review.is_ai_assisted && (
                      <span className="flex items-center gap-0.5 text-[9px] border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded-full">
                        <Sparkles className="w-2 h-2" /> AI
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 ml-auto">
                      {getTimeAgo(review.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-red-500 font-semibold mb-1">{review.movie_title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{review.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full">
                      {STYLE_LABELS[review.style] ?? review.style}
                    </span>
                    <span className="text-[10px] text-gray-600 ml-auto">
                      반영도 {review.match_score}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
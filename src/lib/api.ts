const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY;
const KOFIC_KEY = process.env.KOFIC_API_KEY;

// ✅ 영진위 박스오피스
export async function getBoxOffice() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDt = yesterday.toISOString().slice(0, 10).replace(/-/g, "");

  const res = await fetch(
    `https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOFIC_KEY}&targetDt=${targetDt}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    console.error(`[영진위] HTTP ${res.status}`);
    throw new Error("영진위 API 호출 실패");
  }

  const data = await res.json();
  return data.boxOfficeResult.dailyBoxOfficeList;
}

// ✅ TMDB 영화 검색 (포스터 매칭용)
export async function searchMovieTMDB(title: string, releaseYear?: string) {
  try {
    const yearParam = releaseYear ? `&year=${releaseYear}` : "";
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&language=ko-KR&region=KR&include_adult=false${yearParam}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error(`[TMDB] HTTP ${res.status} — ${title}`);
      return null;
    }

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const sorted = [...data.results].sort((a: any, b: any) => {
      // 1순위: 개봉연도 일치
      if (releaseYear) {
        const aYearMatch = a.release_date?.startsWith(releaseYear) ? 1 : 0;
        const bYearMatch = b.release_date?.startsWith(releaseYear) ? 1 : 0;
        if (aYearMatch !== bYearMatch) return bYearMatch - aYearMatch;
      }
      // 2순위: 한국어 원작 우선 — 연도 유무와 무관하게 항상 적용
      // (예: "짱구" 검색 시 한국 영화 > 일본 애니 "짱구는 못말려")
      const aIsKorean = a.original_language === "ko" ? 1 : 0;
      const bIsKorean = b.original_language === "ko" ? 1 : 0;
      if (aIsKorean !== bIsKorean) return bIsKorean - aIsKorean;
      // 3순위: popularity
      return b.popularity - a.popularity;
    });

    // poster_path 있는 결과 우선 반환, 없으면 최상위 결과
    return sorted.find((m: any) => m.poster_path) ?? sorted[0] ?? null;

  } catch (err) {
    console.error(`[TMDB] 검색 실패 — ${title}:`, err);
    return null;
  }
}

// ✅ TMDB 영화 상세 (큐레이션 결과용)
export async function getMovieForCuration(title: string, year?: string) {
  try {
    const searchRes = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&language=ko-KR${year ? `&year=${year}` : ""}`,
      { next: { revalidate: 3600 } }
    );

    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const results: any[] = searchData.results ?? [];
    if (results.length === 0) return null;

    // 한국어 원작 우선, poster_path 있는 결과 우선
    const sorted = [...results].sort((a, b) => {
      const aIsKorean = a.original_language === "ko" ? 1 : 0;
      const bIsKorean = b.original_language === "ko" ? 1 : 0;
      if (aIsKorean !== bIsKorean) return bIsKorean - aIsKorean;
      return b.popularity - a.popularity;
    });
    const movie = sorted.find((m) => m.poster_path) ?? sorted[0];
    if (!movie) return null;

    const detailRes = await fetch(
      `${TMDB_BASE}/movie/${movie.id}?api_key=${TMDB_KEY}&language=ko-KR&append_to_response=credits`,
      { next: { revalidate: 3600 } }
    );

    if (!detailRes.ok) return null;

    const detail = await detailRes.json();
    const director =
      detail.credits?.crew?.find((c: any) => c.job === "Director")?.name ?? "정보 없음";

    return {
      id: movie.id,
      poster_path: movie.poster_path,
      releaseDate: movie.release_date,
      runtime: detail.runtime,
      director,
      ratings: {
        imdb: "N/A",
        rotten: "N/A",
        metacritic: "N/A",
      },
    };
  } catch (err) {
    console.error(`[TMDB] 상세 조회 실패 — ${title}:`, err);
    return null;
  }
}

// TMDB 인물 상세 + 필모그래피
export async function getPersonDetail(personId: number) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/person/${personId}?api_key=${TMDB_KEY}&language=ko-KR&append_to_response=movie_credits`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    // 출연작 (배우로서) — 상위 24편만, 필요 필드만
    const cast = (data.movie_credits?.cast ?? [])
      .filter((m: any) => m.poster_path && m.release_date)
      .sort((a: any, b: any) => b.popularity - a.popularity)
      .slice(0, 24)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
        character: m.character,
      }));

    // 연출작 (감독으로서) — 상위 12편만, 필요 필드만
    const crew = (data.movie_credits?.crew ?? [])
      .filter((m: any) => m.job === "Director" && m.poster_path && m.release_date)
      .sort((a: any, b: any) => b.popularity - a.popularity)
      .slice(0, 12)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
      }));

    return {
      id: data.id,
      name: data.name,
      profile_path: data.profile_path ?? null,
      known_for_department: data.known_for_department ?? null,
      birthday: data.birthday ?? null,
      place_of_birth: data.place_of_birth ?? null,
      biography: data.biography ? data.biography.slice(0, 1000) : null,
      cast,
      crew,
    };
  } catch (err) {
    console.error("[TMDB] 인물 조회 실패:", err);
    return null;
  }
}

// TMDB 영화 상세 (상세 페이지용)
export async function getMovieDetail(tmdbId: number) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&language=ko-KR&append_to_response=credits,videos,similar`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const director = data.credits?.crew?.find((c: any) => c.job === "Director");
    const cast = data.credits?.cast?.slice(0, 8) ?? [];
    const trailer = data.videos?.results?.find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube"
    );
    const similar = data.similar?.results?.slice(0, 4) ?? [];

    return {
      id: data.id,
      title: data.title,
      original_title: data.original_title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      runtime: data.runtime,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      genres: data.genres ?? [],
      director: director ?? null,
      cast,
      trailer: trailer ?? null,
      similar,
    };
  } catch (err) {
    console.error("[TMDB] 상세 조회 실패:", err);
    return null;
  }
}
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  runtime?: number;
  director?: string;
  overview?: string;
  ratings?: {
    tmdb: number;
    imdb?: string;
    rotten?: string;
    metacritic?: string;
  };
}

export interface BoxOfficeMovie {
  rank: number;
  title: string;
  openDt: string;
  audiCnt: string;     // 당일 관객수
  audiAcc: string;     // 누적 관객수
  tmdbData?: Movie;
}

export interface RecommendResult {
  title: string;
  year: string;
  reason: string;
  poster: string | null;
  id?: number;
  releaseYear: string;
  runtime: string | number;
  director: string;
  ratings: {
    imdb: string;
    rotten: string;
    metacritic: string;
  };
}

export interface Review {
  id: string;
  user_id: string;
  movie_id: string;
  movie_title: string;
  content: string;
  input_keywords: string[];
  is_ai_assisted: boolean;
  is_user_edited: boolean;
  trust_score?: number;
  created_at: string;
  profiles?: {
    nickname: string;
    is_trusted: boolean;
  };
}
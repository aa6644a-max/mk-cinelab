-- 나만의 영화 리스트
-- 서버 클라이언트가 anon key를 사용하므로 RLS 미적용, API 라우트에서 소유권 검사
CREATE TABLE IF NOT EXISTS movie_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 50),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 200),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 리스트에 담긴 영화
CREATE TABLE IF NOT EXISTS movie_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES movie_lists(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (list_id, tmdb_id)
);

CREATE INDEX IF NOT EXISTS idx_movie_lists_user_id ON movie_lists (user_id);
CREATE INDEX IF NOT EXISTS idx_movie_list_items_list_id ON movie_list_items (list_id);
CREATE INDEX IF NOT EXISTS idx_movie_list_items_tmdb_id ON movie_list_items (tmdb_id);

-- profiles 테이블에 gender, birth_date 컬럼이 없는 경우 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

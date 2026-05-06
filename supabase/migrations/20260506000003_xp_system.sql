-- profiles 테이블에 XP 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'rookie';

-- XP 이벤트 기록 테이블
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  xp INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events (user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events (created_at);

-- 티어 계산 함수
CREATE OR REPLACE FUNCTION get_tier(xp INTEGER) RETURNS TEXT AS $$
BEGIN
  IF xp >= 10000 THEN RETURN 'legend';
  ELSIF xp >= 6000 THEN RETURN 'maestro';
  ELSIF xp >= 3000 THEN RETURN 'critic';
  ELSIF xp >= 1500 THEN RETURN 'curator';
  ELSIF xp >= 500 THEN RETURN 'cinephile';
  ELSE RETURN 'rookie';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- XP 적립 트리거 함수 (input_keywords는 text[] 타입)
CREATE OR REPLACE FUNCTION award_review_xp() RETURNS TRIGGER AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  -- guest 리뷰(user_id NULL) 건너뜀
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  -- 기본 100 XP + 키워드당 10 XP + 보너스
  v_xp := 100;
  v_xp := v_xp + COALESCE(array_length(NEW.input_keywords, 1), 0) * 10;
  IF NEW.is_ai_assisted THEN v_xp := v_xp + 20; END IF;
  IF NEW.is_user_edited THEN v_xp := v_xp + 30; END IF;

  -- XP 이벤트 기록
  INSERT INTO xp_events (user_id, source, xp)
  VALUES (NEW.user_id, 'review', v_xp);

  -- profiles 업데이트 (total_xp + v_xp 가 새 총합)
  UPDATE profiles
  SET total_xp = total_xp + v_xp,
      tier = get_tier(total_xp + v_xp)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_insert ON reviews;
CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION award_review_xp();

-- SECURITY DEFINER 추가: anon 키로 실행돼도 postgres 권한으로 동작
CREATE OR REPLACE FUNCTION award_review_xp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  v_xp := 100;
  v_xp := v_xp + COALESCE(array_length(NEW.input_keywords, 1), 0) * 10;
  IF NEW.is_ai_assisted THEN v_xp := v_xp + 20; END IF;
  IF NEW.is_user_edited  THEN v_xp := v_xp + 30; END IF;

  INSERT INTO xp_events (user_id, source, xp)
  VALUES (NEW.user_id, 'review:' || NEW.id, v_xp);

  UPDATE profiles
  SET total_xp = total_xp + v_xp,
      tier = get_tier(total_xp + v_xp)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION revoke_review_xp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  IF OLD.user_id IS NULL THEN RETURN OLD; END IF;

  SELECT xp INTO v_xp
  FROM xp_events
  WHERE user_id = OLD.user_id AND source = 'review:' || OLD.id;

  IF v_xp IS NULL THEN RETURN OLD; END IF;

  DELETE FROM xp_events
  WHERE user_id = OLD.user_id AND source = 'review:' || OLD.id;

  UPDATE profiles
  SET total_xp = GREATEST(0, total_xp - v_xp),
      tier = get_tier(GREATEST(0, total_xp - v_xp))
  WHERE id = OLD.user_id;

  RETURN OLD;
END;
$$;

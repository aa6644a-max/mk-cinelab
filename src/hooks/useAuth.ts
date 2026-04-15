"use client";

import { useEffect, useState, useCallback } from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// 모듈 레벨 싱글톤 상태 — 모든 컴포넌트가 동일한 인스턴스를 공유
let _user: User | null = null;
let _initialized = false;
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

// 구독은 한 번만 등록
let _subscriptionStarted = false;
let _signingOut = false;

function ensureSubscription() {
  if (_subscriptionStarted) return;
  _subscriptionStarted = true;

  supabase.auth.getSession().then(({ data: { session } }) => {
    _user = session?.user ?? null;
    _initialized = true;
    notifyListeners();
  });

  supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      // 로그아웃 진행 중 TOKEN_REFRESHED가 뒤늦게 오면 무시
      if (_signingOut && event !== "SIGNED_OUT") return;

      if (event === "SIGNED_OUT") {
        _signingOut = false;
        _user = null;
      } else {
        _user = session?.user ?? null;
      }
      notifyListeners();

      if (event === "SIGNED_IN" && session?.user?.email) {
        try {
          await supabase.rpc("claim_guest_reviews", {
            p_user_id: session.user.id,
            p_email: session.user.email,
          });
        } catch {}
      }
    }
  );
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(_user);
  const [initialized, setInitialized] = useState(_initialized);

  useEffect(() => {
    ensureSubscription();

    function handleChange() {
      setUser(_user);
      setInitialized(_initialized);
    }

    _listeners.add(handleChange);
    // 이미 초기화된 경우 즉시 동기화
    if (_initialized) handleChange();

    return () => {
      _listeners.delete(handleChange);
    };
  }, []);

  const signOut = useCallback(async () => {
    _signingOut = true;
    _user = null;
    notifyListeners();
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  return { user, initialized, loading: !initialized, signOut };
}

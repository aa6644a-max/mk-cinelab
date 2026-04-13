"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user?.email) {
        try {
          await supabase.rpc("claim_guest_reviews", {
            p_user_id: session.user.id,
            p_email: session.user.email,
          });
        } catch {}
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/auth/callback",
      queryParams: {
        prompt: "select_account", // 항상 계정 선택 화면 표시
      },
    },
  });
};

  const signOut = async () => {
  try {
    // 모든 탭에서 로그아웃
    await supabase.auth.signOut({ scope: "global" });
  } catch (err) {
    console.error("로그아웃 오류:", err);
  } finally {
    // 로컬 스토리지 강제 클리어
    localStorage.clear();
    sessionStorage.clear();
    // 완전 새로고침
    window.location.replace("/");
  }
};

  return { user, loading: false, signInWithGoogle, signOut };
}
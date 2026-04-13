"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 로그인 시 guest 리뷰 자동 연결
      if (event === "SIGNED_IN" && currentUser?.email) {
        try {
          const result = await supabase.rpc("claim_guest_reviews", {
            p_user_id: currentUser.id,
            p_email: currentUser.email,
          });
          if ((result.data ?? 0) > 0) {
            console.log("[auth] guest 리뷰 연결:", result.data + "개");
          }
        } catch (err) {
          console.error("[auth] guest 리뷰 연결 실패:", err);
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
  };

  const signOut = async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
};

  return { user, loading, signInWithGoogle, signOut };
}
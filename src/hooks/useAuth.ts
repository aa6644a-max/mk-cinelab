"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false); // ← 반드시 false로
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false); // ← 여기도

      if (event === "SIGNED_IN" && session?.user?.email) {
        try {
          await supabase.rpc("claim_guest_reviews", {
            p_user_id: session.user.id,
            p_email: session.user.email,
          });
        } catch {}
      }
    });

    // 3초 후 강제로 loading 해제 (안전장치)
    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
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

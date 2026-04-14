"use client";

import { useEffect, useState, useCallback } from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then((response: { data: { session: Session | null }; error: Error | null }) => {
  setUser(response.data.session?.user ?? null);
  setInitialized(true);
});

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN" && session?.user?.email) {
          supabase.rpc("claim_guest_reviews", {
            p_user_id: session.user.id,
            p_email: session.user.email,
          }).catch(() => {});
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
        queryParams: { prompt: "select_account" },
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, initialized, loading: !initialized, signInWithGoogle, signOut };
}
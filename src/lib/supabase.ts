import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storageKey: "mk-cinelab-auth",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      lock: async (name, acquireTimeout, fn) => {
        return await fn();
      },
    },
  }
);
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: "mk-cinelab-auth",
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      }
    );
  }
  return instance;
}

// 모듈이 import되는 시점(서버 사이드 프리렌더링 포함)에 즉시 클라이언트를
// 생성하면 빌드 환경변수가 없을 때 build가 깨진다. 실제로 속성에 접근하는
// 시점(브라우저에서 useEffect/이벤트 핸들러 내부)까지 생성을 미룬다.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    return Reflect.get(client, prop, client);
  },
});

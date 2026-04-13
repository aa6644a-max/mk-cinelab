"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SignoutHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signout") === "true") {
      // URL에서 파라미터 제거 후 강제 새로고침
      window.history.replaceState({}, "", "/");
      window.location.reload();
    }
  }, [searchParams]);

  return null;
}
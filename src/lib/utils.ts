import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TMDB poster URL 유효성 검사 — DB에 잘못 저장된 URL(null, undefined 접합, 경로 없음 등) 방어
export function isValidPosterUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  return /^https:\/\/image\.tmdb\.org\/t\/p\/w\d+\/.+/.test(url);
}

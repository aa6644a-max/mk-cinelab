import { NextRequest, NextResponse } from "next/server";

const BLOCKED_BOTS = [
  "gptbot",
  "oai-searchbot",
  "perplexitybot",
  "anthropic-ai",
  "claudebot",
  "amazonbot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
];

export function middleware(request: NextRequest) {
  const ua = (request.headers.get("user-agent") ?? "").toLowerCase();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/movie/") || pathname.startsWith("/person/")) {
    if (BLOCKED_BOTS.some((bot) => ua.includes(bot))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/movie/:path*", "/person/:path*"],
};

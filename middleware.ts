import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware — no Prisma (edge-incompatible)
// Auth protection is handled per-route via auth() server-side
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

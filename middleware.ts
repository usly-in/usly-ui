import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is now handled client-side. This middleware is a no-op.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Empty matcher — middleware does not intercept any routes.
  matcher: [],
};

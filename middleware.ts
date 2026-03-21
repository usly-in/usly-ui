import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/moments",
  "/chapters",
  "/letters",
  "/invitations",
  "/settings",
  "/memory",
  "/only-us",
];

const ADMIN_ONLY_ROUTES = [
  "/invitations",
  "/settings",
];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && session.user && !session.user.tenantId && !pathname.startsWith("/signup") && !pathname.startsWith("/login") && pathname !== "/" && !pathname.startsWith("/api")) {
    // Authenticated via Google but no tenant yet → must complete onboarding
    return NextResponse.redirect(new URL("/signup?onboarding=1", nextUrl.origin));
  }

  if (isProtected && session) {
    const isAdminOnly = ADMIN_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    if (isAdminOnly && session.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};

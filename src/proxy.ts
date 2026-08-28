// src/proxy.ts
/**
 * Next.js Middleware (Edge runtime compatible).
 * Handles route protection and token refresh using only request cookies —
 * NO "use server" imports, NO next/headers.
 */
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  isValidRedirectForRole,
  UserRole,
} from "./lib/auth-utils";

// ==============================
// Middleware / Proxy
// ==============================

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // ------------------------------
  // Prevent redirect loops after token refresh
  // ------------------------------
  if (request.nextUrl.searchParams.has("tokenRefreshed")) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("tokenRefreshed");
    return NextResponse.redirect(url);
  }

  // ------------------------------
  // Read tokens directly from cookies (Edge-safe)
  // ------------------------------
  const accessToken = request.cookies.get("accessToken")?.value ?? null;
  const refreshToken = request.cookies.get("refreshToken")?.value ?? null;

  let userRole: UserRole | null = null;

  // ------------------------------
  // Decode access token if present
  // ------------------------------
  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;

      // Token payload shape: { userId, role }
      const rawRole = decoded.role as string;
      if (rawRole === "ADMIN" || rawRole === "STUDENT") {
        userRole = rawRole;
      }
    } catch {
      // Access token invalid/expired — check for refresh token
      if (!refreshToken) {
        // Both missing: force login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }
      // Refresh token exists: redirect to token-refresh endpoint
      // The server action will be called server-side after login page load
      // For middleware, we allow the request through and let the server action
      // handle the token refresh on the next server component render
    }
  }

  const routeOwner = getRouteOwner(pathname);
  const isAuth = isAuthRoute(pathname);

  // ------------------------------
  // Rule 1: Logged-in user on auth pages → redirect to dashboard
  // ------------------------------
  if (userRole && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole), request.url),
    );
  }

  // ------------------------------
  // Rule 2: Public route → allow
  // ------------------------------
  if (routeOwner === null) {
    return NextResponse.next();
  }

  // ------------------------------
  // Rule 3: Not logged in on protected route → login
  // ------------------------------
  if (!userRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ------------------------------
  // Rule 4: Common protected routes → allow
  // ------------------------------
  if (routeOwner === "COMMON") {
    return NextResponse.next();
  }

  // ------------------------------
  // Rule 5: Role-based protected routes
  // ------------------------------
  if (!isValidRedirectForRole(pathname, userRole)) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole), request.url),
    );
  }

  return NextResponse.next();
}

// ==============================
// Matcher Config
// ==============================
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};

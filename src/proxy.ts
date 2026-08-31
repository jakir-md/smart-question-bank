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

  console.log("refresh token:", refreshToken);
  console.log("access token:", accessToken);

  let userRole: UserRole | null = null;

  // ------------------------------
  // Decode access token if present
  // ------------------------------
  if (accessToken) {
    try {
      console.log("verified token:");
      const decoded = jwt.verify(
        accessToken,
        "elumpu-access-101" as string,
      ) as JwtPayload;

      // Token payload shape: { userId, role }
      console.log("decoded access token:", decoded);
      const rawRole = decoded.role as string;
      if (rawRole === "ADMIN" || rawRole === "STUDENT") {
        userRole = rawRole;
      }

      console.log({ rawRole });
    } catch (error) {
      // Access token invalid/expired — check for refresh token
      console.log(
        "Access token invalid or expired. Checking refresh token...",
        error,
      );
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

  console.log("Middleware: routeOwner:", routeOwner, "isAuth:", isAuth, "userRole:", userRole);

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
    console.log("Middleware: Allowing access to public route:", pathname);
    return NextResponse.next();
  }

  console.log("Middleware: Protected route detected:", pathname, "with owner:", routeOwner);
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
    console.log("Middleware: Allowing access to common protected route:", pathname);
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

  console.log("Middleware: Access granted for route:", pathname, "with role:", userRole);

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

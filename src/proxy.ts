// src/proxy.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getNewAccessToken, getUserInfo } from "./services/auth.service";
import { getCookie } from "./lib/tokenHandler";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "./lib/auth-utils";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const tokenRefreshResult = await getNewAccessToken();
  if (tokenRefreshResult?.tokenRefreshed) {
    const url = request.nextUrl.clone();
    url.searchParams.set("tokenRefreshed", "true");
    return NextResponse.redirect(url);
  }

  // 3️⃣ Get accessToken from cookies
  const accessToken = (await getCookie("accessToken")) || null;
  let userRole: UserRole | null = null;

  if (accessToken) {
    try {
      const verifiedToken: JwtPayload | string = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      );
      if (typeof verifiedToken === "string") throw new Error("Invalid token");
      userRole = verifiedToken.role;
    } catch (err) {
      console.log("Invalid token found, clearing cookies...");

      const response = pathname === "/login" 
        ? NextResponse.next() 
        : NextResponse.redirect(new URL("/login", request.url));

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      return response;
    }
  }

  const routerOwner = getRouteOwner(pathname);
  const isAuth = isAuthRoute(pathname);


  // 4️⃣ Redirect logged-in users away from auth routes
  if (accessToken && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
    );
  }

  // 5️⃣ Redirect guest users to login if route is protected
  if (!accessToken && !isAuthRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }


  // 7️⃣ Protected common routes
  if (routerOwner === "COMMON") {
    return NextResponse.next();
  }

  // 8️⃣ Role-based protected routes
  const protectedRoles = ["ADMIN",  "STUDENT", "DRIVER"];
  if (protectedRoles.includes(routerOwner || "")) {
    if (userRole !== routerOwner) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};

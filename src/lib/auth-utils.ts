//src/lib/auth-utils.ts

export type UserRole = "ADMIN" | "STUDENT";

export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/change-password"],
  patterns: [],
};

export const studentProtectedRoutes: RouteConfig = {
  patterns: [/^\/student/], // Routes starting with /
  exact: [],
};
export const adminProtectedRoutes: RouteConfig = {
  patterns: [/^\/admin/], // Routes starting with /admin/*
  exact: [], // "/admins"
};

export const isAuthRoute = (pathname: string) => {
  return authRoutes.some((route: string) => route === pathname);
};

export const isRouteMatches = (
  pathname: string,
  routes: RouteConfig,
): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.patterns.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "ADMIN" | "STUDENT" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatches(pathname, studentProtectedRoutes)) {
    return "STUDENT";
  }
  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
};

export const getDefaultDashboardRoute = (
  role: UserRole | UserRole[],
): string => {
  console.log("getDefaultDashboardRoute called with role:", role);
  const normalizedRole = Array.isArray(role) ? role[0] : role;
  if (normalizedRole === "ADMIN") {
    return "/admin/dashboard";
  }
  if (normalizedRole === "STUDENT") {
    return "/";
  }
  return "/";
};

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole,
): boolean => {
  const routeOwner = getRouteOwner(redirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
};

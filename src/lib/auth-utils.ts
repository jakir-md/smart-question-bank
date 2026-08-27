//src/lib/auth-utils.ts

export type UserRole = "ADMIN" | "STUDENT" | "DRIVER" ;

export type RouteConfig = {
    exact: string[],
    patterns: RegExp[],
}

export const authRoutes = ["/login", "/register", "/forgot-password","/reset-password"];

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/change-password"],
    patterns: [], 
}

export const studentProtectedRoutes: RouteConfig = {
    patterns: [/^\/student/], // Routes starting with /
    exact: [], 
}
export const driverProtectedRoutes: RouteConfig = {
    patterns: [/^\/driver/], // Routes starting with /driver/*
    exact: [], 
}
export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/admin/], // Routes starting with /admin/*
    exact: [], // "/admins"
}



export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route: string) => route === pathname);
}

export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.patterns.some((pattern: RegExp) => pattern.test(pathname))
    
}

export const getRouteOwner = (pathname: string): "ADMIN" | "STUDENT" | "DRIVER" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }
    
     if (isRouteMatches(pathname,  driverProtectedRoutes)) {
        return "DRIVER";
    }
    if (isRouteMatches(pathname, studentProtectedRoutes)) {
        return "STUDENT";
    }
    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }
    return null;
}

export const getDefaultDashboardRoute = (role: UserRole): string => {
    if (role === "ADMIN") {
        return "/admin/dashboard";
    }
    if (role === "STUDENT") {
        return "/student/dashboard";
    }
    if (role === "DRIVER") {
        return "/driver/dashboard";
    }
    
    return "/";
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    return false;
}
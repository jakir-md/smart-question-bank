"use server";
// src/services/auth/auth.service.ts

import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import { verifyAccessToken } from "@/lib/jwtHanlders";
import { getDefaultDashboardRoute, UserRole } from "@/lib/auth-utils";
import { deleteCookie, getCookie, setCookie } from "./tokenHandler";

// =========================================================================
// TYPES
// =========================================================================

interface ParsedCookieObject {
  [key: string]: string;
  "Max-Age": string;
  Path: string;
  SameSite: string;
}

// =========================================================================
// HELPERS
// =========================================================================

/**
 * Stores tokens from the response headers into the client cookies.
 *
 * @param headers - Response headers from serverFetch.
 */
const storeTokensFromResponse = async (headers: Headers): Promise<void> => {
  const setCookieHeaders = headers.getSetCookie();

  if (!setCookieHeaders || setCookieHeaders.length === 0) {
    throw new Error("No Set-Cookie header found in response");
  }

  let accessTokenObject: ParsedCookieObject | null = null;
  let refreshTokenObject: ParsedCookieObject | null = null;

  setCookieHeaders.forEach((cookie: string) => {
    const parsedCookie = parse(cookie) as ParsedCookieObject;
    if (parsedCookie["accessToken"]) {
      accessTokenObject = parsedCookie;
    }
    if (parsedCookie["refreshToken"]) {
      refreshTokenObject = parsedCookie;
    }
  });

  if (!accessTokenObject) {
    throw new Error("Access token not found in cookies");
  }
  if (!refreshTokenObject) {
    throw new Error("Refresh token not found in cookies");
  }

  const atObj = accessTokenObject as ParsedCookieObject & {
    accessToken: string;
  };
  const rtObj = refreshTokenObject as ParsedCookieObject & {
    refreshToken: string;
  };

  await deleteCookie("accessToken");
  await setCookie("accessToken", atObj.accessToken, {
    secure: true,
    httpOnly: true,
    maxAge: parseInt(atObj["Max-Age"]) || 1000 * 60 * 60,
    path: atObj["Path"] || "/",
    sameSite: (atObj["SameSite"] as "none" | "lax" | "strict") || "lax",
  });

  await deleteCookie("refreshToken");
  await setCookie("refreshToken", rtObj.refreshToken, {
    secure: true,
    httpOnly: true,
    maxAge: parseInt(rtObj["Max-Age"]) || 1000 * 60 * 60 * 24 * 7,
    path: rtObj["Path"] || "/",
    sameSite: (rtObj["SameSite"] as "none" | "lax" | "strict") || "lax",
  });
};

// =========================================================================
// STEP 1: CHECK PHONE ACTION
// =========================================================================

/**
 * Server action to verify if the phone number exists and has a password set.
 *
 * @param phone - 11-digit Bangladeshi phone number.
 * @returns Success flag, boolean of hasPassword, and any message.
 */
export const checkPhoneAction = async (
  phone: string,
): Promise<{ success: boolean; hasPassword?: boolean; message?: string }> => {
  try {
    const res = await serverFetch.post("/auth/check-phone", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to verify phone number.",
      };
    }

    return {
      success: true,
      hasPassword: result.data?.hasPassword,
      message: result.message,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
};

// =========================================================================
// STEP 2A: PASSWORD LOGIN ACTION
// =========================================================================

/**
 * Server action to authenticate a user using phone and password.
 *
 * @param phone - 11-digit Bangladeshi phone number.
 * @param password - Plaintext password.
 * @returns Object with error state, or redirects on success.
 */
export const loginWithPasswordAction = async (
  phone: string,
  password: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await serverFetch.post("/auth/login-with-password", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Password mismatch.",
      };
    }

    await storeTokensFromResponse(res.headers);

    const userRole = result.data?.role as UserRole;
    redirect(getDefaultDashboardRoute(userRole));
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
};

// =========================================================================
// STEP 2B: VERIFY OTP ACTION
// =========================================================================

/**
 * Server action to verify a student's OTP and complete login.
 *
 * @param phone - 11-digit Bangladeshi phone number.
 * @param otp   - The 6-digit OTP code.
 * @returns Object with error state, or redirects on success.
 */
export const verifyOtpAction = async (
  phone: string,
  otp: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await serverFetch.post("/auth/verify-otp", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "OTP verification failed.",
      };
    }

    await storeTokensFromResponse(res.headers);

    const userRole = result.data?.role as UserRole;
    redirect(getDefaultDashboardRoute(userRole));
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
};

// =========================================================================
// TOKEN REFRESH
// =========================================================================

/**
 * Refreshes client tokens if the access token has expired but refresh token exists.
 *
 * @returns Status of refresh.
 */
export const getNewAccessToken = async (): Promise<{
  tokenRefreshed: boolean;
  success?: boolean;
  message?: string;
}> => {
  try {
    const accessToken = await getCookie("accessToken");
    const refreshToken = await getCookie("refreshToken");

    if (!accessToken && !refreshToken) {
      return { tokenRefreshed: false };
    }

    if (accessToken) {
      const verifiedToken = await verifyAccessToken(accessToken);
      if (verifiedToken.success) {
        return { tokenRefreshed: false };
      }
    }

    if (!refreshToken) {
      return { tokenRefreshed: false };
    }

    const response = await serverFetch.post("/auth/refresh-token", {
      headers: { Cookie: `refreshToken=${refreshToken}` },
    });

    const result = await response.json();

    await storeTokensFromResponse(response.headers);

    if (!result.success) {
      throw new Error(result.message || "Token refresh failed");
    }

    return {
      tokenRefreshed: true,
      success: true,
      message: "Token refreshed successfully",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return { tokenRefreshed: false, success: false, message };
  }
};

// =========================================================================
// FORGOT & RESET PASSWORD COMPATIBILITY STUBS
// =========================================================================

/**
 * Server action - sends an OTP to reset password.
 * In this system, this uses the checkPhoneAction endpoint.
 */
export const forgotPassword = async (
  phone: string,
): Promise<{ success: boolean; message: string }> => {
  const res = await checkPhoneAction(phone);
  return { success: res.success, message: res.message || "" };
};

/**
 * Server action - resets the password using OTP.
 * In this system, this verifies OTP.
 */
export const resetPassword = async (
  phone: string,
  otp: string,
  _newPassword?: string,
): Promise<{ success: boolean; message: string }> => {
  return verifyOtpAction(phone, otp);
};

// =========================================================================
// LOGOUT ACTION
// =========================================================================

/**
 * Server action to clear cookies and request session end on the server.
 */
export const logoutAction = async (): Promise<void> => {
  try {
    await serverFetch.post("/auth/logout", {});
  } catch {
    // Ignore session cleanup failures
  } finally {
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    redirect("/login");
  }
};

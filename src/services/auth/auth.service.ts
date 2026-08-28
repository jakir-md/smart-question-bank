"use server";
// src/services/auth/auth.service.ts

import { parse } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import { verifyAccessToken } from "@/lib/jwtHanlders";
import { getCookie, setCookie, deleteCookie } from "./tokenHandler";

// =========================================================================
// TYPES
// =========================================================================

/**
 * Cookie options parsed from a Set-Cookie header value.
 */
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
 * Stores accessToken and refreshToken from Set-Cookie response headers
 * into the Next.js cookie store.
 *
 * @param headers - The response Headers object from fetch.
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

  const atObj = accessTokenObject as ParsedCookieObject & { accessToken: string };
  const rtObj = refreshTokenObject as ParsedCookieObject & { refreshToken: string };

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
// SEND OTP ACTION
// =========================================================================

/**
 * Server action — sends a 6-digit OTP to the given phone number.
 *
 * @param phone - 11-digit Bangladeshi phone number.
 * @returns Success flag and a message, or an error message.
 */
export const sendOtpAction = async (
  phone: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await serverFetch.post("/auth/send-otp", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return { success: false, message: result.message || "Failed to send OTP" };
    }

    return { success: true, message: result.message || "OTP sent successfully" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
};

// =========================================================================
// VERIFY OTP ACTION (STUDENT LOGIN)
// =========================================================================

/**
 * Server action — verifies the OTP for a student, stores tokens in cookies,
 * and redirects to the home page on success.
 *
 * @param phone - 11-digit Bangladeshi phone number.
 * @param otp   - The 6-digit OTP entered by the student.
 * @returns Error state (success false + message) or never (on redirect).
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
      return { success: false, message: result.message || "OTP verification failed" };
    }

    await storeTokensFromResponse(res.headers);

    redirect("/");
  } catch (error: unknown) {
    // Allow Next.js redirect errors to propagate
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
};

// =========================================================================
// ADMIN LOGIN ACTION
// =========================================================================

/**
 * Server action — authenticates an admin via phone + password.
 * Stores tokens in cookies and redirects to the admin dashboard.
 *
 * @param phone    - The admin's registered phone number.
 * @param password - The admin's plaintext password.
 * @returns Error state or never (on redirect).
 */
export const adminLoginAction = async (
  phone: string,
  password: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await serverFetch.post("/auth/login", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return { success: false, message: result.message || "Login failed" };
    }

    await storeTokensFromResponse(res.headers);

    // Decode token to get role and redirect to admin dashboard
    const accessToken = await getCookie("accessToken");
    if (accessToken) {
      const decoded = jwt.decode(accessToken) as JwtPayload | null;
      if (decoded?.role === "ADMIN") {
        redirect("/admin/dashboard");
      }
    }

    redirect("/");
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
};

// =========================================================================
// REFRESH TOKEN
// =========================================================================

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Called automatically by serverFetch before every protected API call.
 *
 * @returns Whether the token was refreshed.
 */
export const getNewAccessToken = async (): Promise<{
  tokenRefreshed: boolean;
  success?: boolean;
  message?: string;
}> => {
  try {
    const accessToken = await getCookie("accessToken");
    const refreshToken = await getCookie("refreshToken");

    // Case 1: Both tokens are missing — user is logged out
    if (!accessToken && !refreshToken) {
      return { tokenRefreshed: false };
    }

    // Case 2: Access token exists and is still valid
    if (accessToken) {
      const verifiedToken = await verifyAccessToken(accessToken);
      if (verifiedToken.success) {
        return { tokenRefreshed: false };
      }
    }

    // Case 3: Refresh token is also missing
    if (!refreshToken) {
      return { tokenRefreshed: false };
    }

    // Case 4: Access token expired — use refresh token to get new ones
    const response = await serverFetch.post("/auth/refresh-token", {
      headers: { Cookie: `refreshToken=${refreshToken}` },
    });

    const result = await response.json();

    await storeTokensFromResponse(response.headers);

    if (!result.success) {
      throw new Error(result.message || "Token refresh failed");
    }

    return { tokenRefreshed: true, success: true, message: "Token refreshed successfully" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return { tokenRefreshed: false, success: false, message };
  }
};

// =========================================================================
// FORGOT PASSWORD ACTION (wraps sendOtpAction for the forgot-password page)
// =========================================================================

/**
 * Server action — sends an OTP to the phone for password-reset purposes.
 * In this OTP-based system, this is identical to sendOtpAction.
 *
 * @param phone - 11-digit Bangladeshi phone number.
 * @returns Success flag and message.
 */
export const forgotPassword = async (
  phone: string,
): Promise<{ success: boolean; message: string }> => {
  return sendOtpAction(phone);
};

// =========================================================================
// RESET PASSWORD ACTION (stub — OTP flow handles password reset via verify-otp)
// =========================================================================

/**
 * Server action stub for the reset-password page.
 * In this app, students reset access by re-logging in with OTP (no password).
 * This stub exists for compile compatibility.
 *
 * @param phone       - 11-digit Bangladeshi phone number.
 * @param otp         - The 6-digit OTP.
 * @param _newPassword - Unused (no password in student flow).
 * @returns Result of OTP verification.
 */
export const resetPassword = async (
  phone: string,
  otp: string,
  _newPassword: string,
): Promise<{ success: boolean; message: string }> => {
  return verifyOtpAction(phone, otp);
};


/**
 * Server action — clears auth cookies and calls the backend logout endpoint.
 */
export const logoutAction = async (): Promise<void> => {
  try {
    await serverFetch.post("/auth/logout", {});
  } catch {
    // Swallow errors — cookies will be cleared regardless
  } finally {
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    redirect("/login");
  }
};

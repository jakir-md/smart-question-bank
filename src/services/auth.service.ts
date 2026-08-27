// src/services/auth/auth.service.ts

import { verifyAccessToken } from "@/lib/jwtHanlders";
import { serverFetch } from "@/lib/server-fetch";
import { deleteCookie, getCookie, setCookie } from "@/lib/tokenHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { parse } from "cookie";
import { UserRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";


export async function getNewAccessToken() {
  try {
    const accessToken = await getCookie("accessToken");
    const refreshToken = await getCookie("refreshToken");
    //Case 1: Both tokens are missing - user is logged out
    if (!accessToken && !refreshToken) {
      return {
        tokenRefreshed: false,
      };
    }
    // Case 2 : Access Token exist- and need to verify
    if (accessToken) {
      const verifiedToken = await verifyAccessToken(accessToken);

      if (verifiedToken.success) {
        return {
          tokenRefreshed: false,
        };
      }
    }
    //Case 3 : refresh Token is missing- user is logged out
    if (!refreshToken) {
      return {
        tokenRefreshed: false,
      };
    }
    //Case 4: Access Token is invalid/expired- try to get a new one using refresh token
    // This is the only case we need to call the API

    // Now we know: accessToken is invalid/missing AND refreshToken exists
    // Safe to call the API
    let accessTokenObject: null | any = null;
    let refreshTokenObject: null | any = null;

    // API Call - serverFetch will skip getNewAccessToken for /auth/refresh-token endpoint
    const response = await serverFetch.post("auth/refresh-token", {
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    const result = await response.json();
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie: string) => {
        const parsedCookie = parse(cookie);

        if (parsedCookie["accessToken"]) {
          accessTokenObject = parsedCookie;
        }
        if (parsedCookie["refreshToken"]) {
          refreshTokenObject = parsedCookie;
        }
      });
    } else {
      throw new Error("No Set-Cookie header found");
    }

    if (!accessTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    if (!refreshTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    await deleteCookie("accessToken");
    await setCookie("accessToken", accessTokenObject.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
      path: accessTokenObject.Path || "/",
      sameSite: accessTokenObject["SameSite"] || "none",
    });

    await deleteCookie("refreshToken");
    await setCookie("refreshToken", refreshTokenObject.refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge:
        parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
      path: refreshTokenObject.Path || "/",
      sameSite: refreshTokenObject["SameSite"] || "none",
    });

    if (!result.success) {
      throw new Error(result.message || "Token refresh failed");
    }
    return {
      tokenRefreshed: true,
      success: true,
      message: "Token refreshed successfully",
    };
  } catch (error: any) {
    return {
      tokenRefreshed: false,
      success: false,
      message: error?.message || "Something went wrong",
    };
  }
}

//change password
export const changePasswordAPI = async (data: any) => {
  const res = await serverFetch.patch(`/auth/change-password`, {
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to change password");
  return result;
};

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = async (phone: string) => {
  const res = await serverFetch.post(`/auth/forgot-password`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send OTP via SMS");
  return data;
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (
  phone: string,
  otp: string,
  newPassword: string,
) => {
  const res = await serverFetch.post(`/auth/reset-password`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to reset password");
  return data;
};

export const getUserInfo = async ()=> {
  // 2. Use the interface here
  try {
    const response = await serverFetch.get("auth/me");
    const result = await response.json();
   // console.log("User Info Response:", result);

    if (result.success) {
      const accessToken = await getCookie("accessToken");
     // console.log("Access Token for user info:", accessToken);

      if (!accessToken) throw new Error("No access token found");

      const verifiedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;
      //console.log("Verified Token in getUserInfo:", verifiedToken);
      return {
        id: verifiedToken.userId,
        email: result.data.email,
        phone: result.data.phone,
        name: result.data.name || "Unknown User",
          role: verifiedToken.role,
        avatarUrl: result.data.avatarUrl || null,
      };
    }

    throw new Error("Failed to fetch user");
  } catch (error: any) {
    console.log(error);
    // Return a consistent "logged out" object
    return {
      _id: "",
      username: "Guest",
      email: "",
      role: "",
     
    };
  }
};


function parseCookieString(str: string) {
  const parts = str.split(";").map((p) => p.trim());
  const [key, value] = parts[0].split("=");

  const attributes: any = { [key]: value };

  parts.slice(1).forEach((attr) => {
    const [aKey, aVal] = attr.split("=");
    attributes[aKey] = aVal ? aVal : true;
  });

  return attributes;
}

type LoginResponse =
  | {
      success: true;
      role: UserRole;
    }
  | {
      success: false;
      message: string;
      errors?: {
        field: PropertyKey;
        message: string;
      }[];
    };

export const loginUser = async (formData: FormData): Promise<LoginResponse> => {
  try {
    const payload = {
      email: formData.get("email") as string,
      password: formData.get("password"),
    };
    console.log("API Payload:", payload);
    const res = await serverFetch.post("auth/login", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const setCookieHeader = res.headers.getSetCookie(); 
     const fallbackHeader = res.headers.get("set-cookie"); // ম্যানুয়াল চেক

        console.log("Headers Debug:", {
          allHeaders: Object.fromEntries(res.headers.entries()),
          fallback: fallbackHeader
        });

    console.log("Raw Response:", res);

    const result = await res.json();
    console.log("Response Body:", result); // দেখুন এখানে accessToken আছে কি না
    console.log("Raw Cookies:", res.headers.getSetCookie()); // দেখুন হেডার খালি কি না

    if (!res.ok) {
      return {
        success: false,
        message: result?.message || "Invalid credentials",
      };
    }

    //const setCookieHeader = res.headers.getSetCookie();
    //console.log("Raw Set-Cookies:", setCookieHeader);

    // let accessTokenObj: any = null;
    // let refreshTokenObj: any = null;

    // setCookieHeader.forEach((cookieStr: string) => {
    //   const parsed = parseCookieString(cookieStr);
    //   if (parsed.accessToken) accessTokenObj = parsed;
    //   if (parsed.refreshToken) refreshTokenObj = parsed;
    // });

    // if (!accessTokenObj || !refreshTokenObj) {
    //   throw new Error("Tokens not found");
    // }

    // await setCookie("accessToken", accessTokenObj.accessToken, {
    //   maxAge: Number(accessTokenObj["Max-Age"]),
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: accessTokenObj["SameSite"] || "lax",
    //   path: "/",
    // });

    // await setCookie("refreshToken", refreshTokenObj.refreshToken, {
    //   maxAge: Number(refreshTokenObj["Max-Age"]),
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: refreshTokenObj["SameSite"] || "lax",
    //   path: "/",
    // });

  //   const verifiedToken = jwt.verify(
  //     accessTokenObj.accessToken,
  //     process.env.ACCESS_TOKEN_SECRET as string,
  //   ) as JwtPayload;
  //  console.log("Verified Token:", verifiedToken);
  //   const userRole: UserRole = verifiedToken.role;

    return {
      success: true,
      role: result.data.role as UserRole,
    };
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Login Error:", error);

    return {
      success: false,
      message: "Login failed",
    };
  }
};

export const logoutUser = async () => {
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    redirect("/login?logout=true")
};
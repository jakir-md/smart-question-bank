/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "../../lib/server-fetch";

export enum RoleType {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
}

// ======================
// User Status
// ======================
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export type UserInfo = {
  id: string;
  email: string | null;
  phone: string | null;
  roles: RoleType[];
  status: UserStatus;
  shopSlug: string | null; // ✅ derived
  displayName: string; // ✅ derived
  profileImage?: string; // ✅ derived
  isOnboarded: boolean;
  classId: string | null;
};

export const getUserInfo = async (): Promise<{
  isAuthenticated: boolean;
  user?: UserInfo;
}> => {
  try {
    const response = await serverFetch.get("/auth/me", {
      cache: "force-cache",
      next: { tags: ["user-info"] },
    });

    // if (!response.ok) {
    //   return { isAuthenticated: false };
    // }

    const result = await response.json();
    console.log("result from /auth/me:", result);
    if (!result.success) {
      return { isAuthenticated: false };
    }
    const user = result.data;
    //console.log("Fetched user info:", user);
    const displayName =
      typeof user.email === "string" && user.email.includes("@")
        ? user.email.split("@")[0]
        : user.phone
          ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}`
          : "User";

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || null,
        phone: user.phone || null,
        roles: Array.isArray(user.roles) ? user.roles : [user.role],
        status: user.status || "ACTIVE",
        displayName: user.name || displayName,
        profileImage: user.profileImage ?? undefined,
        shopSlug: user.shopSlug ?? null,
        isOnboarded: user.name ?? false,
        classId: user.classId ?? null,
      },
    };
  } catch (error: any) {
    console.error("getUserInfo error:", error);
    return { isAuthenticated: false };
  }
};

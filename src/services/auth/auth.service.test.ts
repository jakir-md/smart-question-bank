// src/services/auth/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/server-fetch", () => ({
  serverFetch: {
    post: vi.fn(),
  },
}));

vi.mock("./tokenHandler", () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

vi.mock("@/lib/jwtHanlders", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    decode: vi.fn(),
    verify: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { serverFetch } from "@/lib/server-fetch";
import { checkPhoneAction, loginWithPasswordAction, verifyOtpAction } from "./auth.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createMockResponse = (
  body: object,
  options: {
    ok?: boolean;
    setCookieHeaders?: string[];
  } = {},
): Response => {
  const { ok = true, setCookieHeaders = [] } = options;
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
    headers: {
      getSetCookie: vi.fn().mockReturnValue(setCookieHeaders),
    },
  } as unknown as Response;
};

// ---------------------------------------------------------------------------
// checkPhoneAction
// ---------------------------------------------------------------------------

describe("checkPhoneAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success and hasPassword state when backend succeeds", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({
        success: true,
        data: { hasPassword: true },
        message: "Checked successfully",
      }),
    );

    const result = await checkPhoneAction("01712345678");

    expect(result.success).toBe(true);
    expect(result.hasPassword).toBe(true);
    expect(serverFetch.post).toHaveBeenCalledWith(
      "/auth/check-phone",
      expect.objectContaining({ body: JSON.stringify({ phone: "01712345678" }) }),
    );
  });

  it("should return failure if API fails", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: false, message: "Error" }, { ok: false }),
    );

    const result = await checkPhoneAction("01712345678");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error");
  });
});

// ---------------------------------------------------------------------------
// loginWithPasswordAction
// ---------------------------------------------------------------------------

describe("loginWithPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success/redirect on correct password", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse(
        {
          success: true,
          data: { role: "ADMIN" },
        },
        {
          setCookieHeaders: [
            "accessToken=token; Max-Age=3600; Path=/; SameSite=lax",
            "refreshToken=token; Max-Age=604800; Path=/; SameSite=lax",
          ],
        },
      ),
    );

    const result = await loginWithPasswordAction("01712345678", "secret");
    expect(result).toBeUndefined(); // redirects
  });

  it("should return failure on incorrect credentials", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: false, message: "Mismatch" }, { ok: false }),
    );

    const result = await loginWithPasswordAction("01712345678", "wrong");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Mismatch");
  });
});

// ---------------------------------------------------------------------------
// verifyOtpAction
// ---------------------------------------------------------------------------

describe("verifyOtpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return failure when OTP is incorrect", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: false, message: "Invalid OTP" }, { ok: false }),
    );

    const result = await verifyOtpAction("01712345678", "000000");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid OTP");
  });
});

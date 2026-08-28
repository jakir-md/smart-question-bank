// src/services/auth/auth.service.test.ts
/**
 * Unit tests for client-side auth.service.ts server actions.
 *
 * Strategy: Mock serverFetch, cookie handlers, and next/navigation
 * so no real HTTP calls or cookie writes happen.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/server-fetch", () => ({
  serverFetch: {
    post: vi.fn(),
  },
}));

vi.mock("./tokenHandlers", () => ({
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
import { sendOtpAction, verifyOtpAction } from "./auth.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal mock Response with json() and headers.getSetCookie().
 */
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
// sendOtpAction
// ---------------------------------------------------------------------------

describe("sendOtpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success when the API responds with success:true", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: true, message: "OTP sent successfully" }),
    );

    const result = await sendOtpAction("01712345678");

    expect(result.success).toBe(true);
    expect(result.message).toContain("OTP sent");
    expect(serverFetch.post).toHaveBeenCalledWith(
      "/auth/send-otp",
      expect.objectContaining({ body: JSON.stringify({ phone: "01712345678" }) }),
    );
  });

  it("should return failure when API responds with success:false", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: false, message: "User blocked" }, { ok: false }),
    );

    const result = await sendOtpAction("01712345678");

    expect(result.success).toBe(false);
    expect(result.message).toBe("User blocked");
  });

  it("should return failure on network error", async () => {
    vi.mocked(serverFetch.post).mockRejectedValue(new Error("Network error"));

    const result = await sendOtpAction("01712345678");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Network error");
  });
});

// ---------------------------------------------------------------------------
// verifyOtpAction
// ---------------------------------------------------------------------------

describe("verifyOtpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return failure when OTP is wrong", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: false, message: "Invalid OTP" }, { ok: false }),
    );

    const result = await verifyOtpAction("01712345678", "000000");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid OTP");
  });

  it("should return failure when no Set-Cookie headers present", async () => {
    vi.mocked(serverFetch.post).mockResolvedValue(
      createMockResponse({ success: true }, { setCookieHeaders: [] }),
    );

    const result = await verifyOtpAction("01712345678", "123456");

    expect(result.success).toBe(false);
    expect(result.message).toContain("Set-Cookie");
  });

  it("should return failure on network error", async () => {
    vi.mocked(serverFetch.post).mockRejectedValue(new Error("timeout"));

    const result = await verifyOtpAction("01712345678", "123456");

    expect(result.success).toBe(false);
    expect(result.message).toBe("timeout");
  });
});

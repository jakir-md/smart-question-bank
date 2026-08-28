"use client";
// src/app/(commonLayout)/(auth)/login/page.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { z } from "zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  sendOtpAction,
  verifyOtpAction,
  adminLoginAction,
} from "@/services/auth/auth.service";

// =========================================================================
// ZOD SCHEMAS
// =========================================================================

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^01[3-9]\d{8}$/,
      "Enter a valid 11-digit BD phone (e.g. 01712345678)",
    ),
  isAdmin: z.boolean(),
  password: z.string().optional(),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

// =========================================================================
// LOGIN PAGE
import React from "react";

// =========================================================================

/**
 * LoginPage — 3-step authentication UI.
 *
 * Step 1: User enters phone number (+ password if admin checkbox ticked).
 *   - Student: sends OTP via SMS → proceed to step 2.
 *   - Admin: directly submits phone + password.
 * Step 2 (Student only): User enters 6-digit OTP.
 *   - On success: redirect to home page "/".
 */
export default function LoginPage(): React.ReactNode {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // ----- Phone Form -----
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", isAdmin: false, password: "" },
  });

  // ----- OTP Form -----
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // -----------------------------------------------------------------------
  // STEP 1: Phone submission
  // -----------------------------------------------------------------------

  const handlePhoneSubmit = (data: PhoneFormValues): void => {
    startTransition(async () => {
      if (isAdminMode) {
        // Admin: phone + password login
        if (!data.password) {
          phoneForm.setError("password", {
            message: "Password is required for admin login",
          });
          return;
        }

        const result = await adminLoginAction(data.phone, data.password);

        if (result && !result.success) {
          toast.error(result.message || "Login failed");
        }
        // On success, adminLoginAction redirects server-side
      } else {
        // Student: send OTP
        const result = await sendOtpAction(data.phone);

        if (!result.success) {
          toast.error(result.message || "Failed to send OTP");
          return;
        }

        setPhoneNumber(data.phone);
        toast.success("OTP sent! Check your phone.");
        setStep("otp");
      }
    });
  };

  // -----------------------------------------------------------------------
  // STEP 2: OTP submission
  // -----------------------------------------------------------------------

  const handleOtpSubmit = (data: OtpFormValues): void => {
    startTransition(async () => {
      const result = await verifyOtpAction(phoneNumber, data.otp);

      if (result && !result.success) {
        toast.error(result.message || "OTP verification failed");
      }
      // On success, verifyOtpAction redirects server-side to "/"
    });
  };

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 relative">
      <div className="relative z-10 w-full max-w-5xl rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[550px]">
        {/* ---- LEFT SIDE: FORM ---- */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold">
              {step === "phone" ? "Welcome" : "Enter OTP"}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              {step === "phone"
                ? "Enter your phone number to continue"
                : `We sent a 6-digit code to ${phoneNumber}`}
            </p>
          </div>

          {/* ---------- STEP 1: PHONE FORM ---------- */}
          {step === "phone" && (
            <form
              className="space-y-5"
              onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
            >
              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all ${
                      phoneForm.formState.errors.phone
                        ? "border-red-300 ring-red-100"
                        : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                    placeholder="01XXXXXXXXX"
                    {...phoneForm.register("phone")}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Admin Mode Toggle */}
              <div className="flex items-center gap-2">
                <input
                  id="adminMode"
                  type="checkbox"
                  className="w-4 h-4 rounded accent-emerald-600"
                  checked={isAdminMode}
                  onChange={(e) => setIsAdminMode(e.target.checked)}
                />
                <label
                  htmlFor="adminMode"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Login as Admin
                </label>
              </div>

              {/* Password Field (only in admin mode) */}
              {isAdminMode && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all ${
                        phoneForm.formState.errors.password
                          ? "border-red-300 ring-red-100"
                          : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                      placeholder="••••••••"
                      {...phoneForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {phoneForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {phoneForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 mt-4"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isAdminMode ? "Sign In" : "Get OTP"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* ---------- STEP 2: OTP FORM ---------- */}
          {step === "otp" && (
            <form
              className="space-y-5"
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            >
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  6-Digit OTP
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all tracking-widest text-center text-lg font-bold ${
                      otpForm.formState.errors.otp
                        ? "border-red-300 ring-red-100"
                        : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    }`}
                    placeholder="• • • • • •"
                    {...otpForm.register("otp")}
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-xs text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              {/* Resend OTP */}
              <p className="text-sm text-slate-500">
                Did not receive the code?{" "}
                <button
                  type="button"
                  disabled={isPending}
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                  onClick={() => {
                    startTransition(async () => {
                      const result = await sendOtpAction(phoneNumber);
                      if (result.success) {
                        toast.success("OTP resent!");
                      } else {
                        toast.error(result.message);
                      }
                    });
                  }}
                >
                  Resend
                </button>
              </p>

              {/* Back + Verify */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="flex-1 h-11"
                  onClick={() => {
                    setStep("phone");
                    otpForm.reset();
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* ---- RIGHT SIDE: BANNER ---- */}
        <div className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl opacity-60" />
          <Image
            src="https://res.cloudinary.com/di54jhuow/image/upload/v1772891060/Jahangirnagar_University_Logo_rixxyt.svg"
            alt="Logo"
            width={300}
            height={300}
            className="object-cover relative z-10 drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

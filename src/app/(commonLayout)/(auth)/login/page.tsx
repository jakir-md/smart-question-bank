"use client";
// src/app/(commonLayout)/(auth)/login/page.tsx

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { checkPhoneAction, loginWithPasswordAction, verifyOtpAction } from "@/services/auth/auth.service";

// =========================================================================
// ZOD SCHEMAS
// =========================================================================

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit BD phone (e.g. 01712345678)"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

// =========================================================================
// LOGIN PAGE
// =========================================================================

export default function LoginPage(): React.ReactNode {
  const [step, setStep] = useState<"phone" | "password" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // ----- Forms -----
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // -----------------------------------------------------------------------
  // STEP 1: Phone submission
  // -----------------------------------------------------------------------
  const handlePhoneSubmit = (data: PhoneFormValues): void => {
    startTransition(async () => {
      const result = await checkPhoneAction(data.phone);

      if (!result.success) {
        toast.error(result.message || "Failed to check phone number.");
        return;
      }

      setPhoneNumber(data.phone);

      if (result.hasPassword) {
        toast.success("Please enter your password.");
        setStep("password");
      } else {
        toast.success("OTP sent! Please check your phone.");
        setStep("otp");
      }
    });
  };

  // -----------------------------------------------------------------------
  // STEP 2A: Password submission
  // -----------------------------------------------------------------------
  const handlePasswordSubmit = (data: PasswordFormValues): void => {
    startTransition(async () => {
      const result = await loginWithPasswordAction(phoneNumber, data.password);

      if (result && !result.success) {
        toast.error(result.message || "Password mismatch.");
      }
    });
  };

  // -----------------------------------------------------------------------
  // STEP 2B: OTP submission
  // -----------------------------------------------------------------------
  const handleOtpSubmit = (data: OtpFormValues): void => {
    startTransition(async () => {
      const result = await verifyOtpAction(phoneNumber, data.otp);

      if (result && !result.success) {
        toast.error(result.message || "OTP mismatch.");
      }
    });
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container rounded-full blur-[100px]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col">
        
        {/* Illustration Header */}
        <div className="w-full h-[180px] bg-surface-container-low relative">
          <img
            className="w-full h-full object-cover"
            alt="Glowing book illustration representing learning and portal system"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrxtG3UQdpB3Xv1s_NWA6_dHbTgxifmhW1FyKUriRLiG9TtHnPO7C5LHurdnwAUoANeTbBZRYRZnR8ZwyBiKvE9vT_JQf-V13I05Ke21w7zuZg1175oBNLA_O80Ktje1xbAFOvRoFF-5dWd9UP9nK4YhiMcat-fUOtgem9RyJN82lbRhQf_4CRHyOwEZvFzF4T5HwsNTWDAw4FDGW9FZT0OOhsVozol_0u_hZ4GS-R0uGo7S5QbsnF"
          />
        </div>

        {/* Form Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Brand & Welcome */}
          <div className="text-center flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                menu_book
              </span>
              <h1 className="text-2xl font-bold text-on-surface">Lumina Learn</h1>
            </div>
            <p className="text-sm text-on-surface-variant">
              {step === "phone" && "Welcome back. Continue your learning journey."}
              {step === "password" && `Provide password for account ${phoneNumber}`}
              {step === "otp" && `We sent a 6-digit code to ${phoneNumber}`}
            </p>
          </div>

          {/* ---------- STEP 1: PHONE FORM ---------- */}
          {step === "phone" && (
            <form
              className="flex flex-col gap-4"
              onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm text-secondary font-medium" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    phone
                  </span>
                  <input
                    className={`w-full h-[48px] pl-[44px] pr-4 rounded-xl border bg-surface-container-lowest outline-none transition-all text-on-surface placeholder:text-outline-variant ${
                      phoneForm.formState.errors.phone
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
                    }`}
                    id="phone"
                    placeholder="01XXXXXXXXX"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    {...phoneForm.register("phone")}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-red-600 font-medium">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                disabled={isPending}
                className="mt-2 h-[48px] w-full bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 active:scale-[0.98] duration-150 cursor-pointer disabled:opacity-75"
                type="submit"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    Checking...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Next
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </span>
                )}
              </button>
            </form>
          )}

          {/* ---------- STEP 2A: PASSWORD FORM ---------- */}
          {step === "password" && (
            <form
              className="flex flex-col gap-4"
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-secondary font-medium" htmlFor="password">
                    Password
                  </label>
                  <a className="text-sm text-primary hover:underline font-medium" href="#">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    lock
                  </span>
                  <input
                    className={`w-full h-[48px] pl-[44px] pr-[44px] rounded-xl border bg-surface-container-lowest outline-none transition-all text-on-surface placeholder:text-outline-variant ${
                      passwordForm.formState.errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
                    }`}
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    {...passwordForm.register("password")}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="text-xs text-red-600 font-medium">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  className="flex-1 h-[48px] rounded-xl border border-outline text-outline font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
                  onClick={() => {
                    setStep("phone");
                    passwordForm.reset();
                  }}
                >
                  Back
                </button>
                <button
                  disabled={isPending}
                  className="flex-1 h-[48px] bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 active:scale-[0.98] duration-150 cursor-pointer"
                  type="submit"
                >
                  {isPending ? (
                    "Signing in..."
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ---------- STEP 2B: OTP FORM ---------- */}
          {step === "otp" && (
            <form
              className="flex flex-col gap-4"
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm text-secondary font-medium" htmlFor="otp">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    shield
                  </span>
                  <input
                    className={`w-full h-[48px] pl-[44px] pr-4 rounded-xl border bg-surface-container-lowest outline-none transition-all tracking-widest text-center text-lg font-bold text-on-surface placeholder:text-outline-variant ${
                      otpForm.formState.errors.otp
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
                    }`}
                    id="otp"
                    placeholder="• • • • • •"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    {...otpForm.register("otp")}
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-red-600 font-medium">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  className="flex-1 h-[48px] rounded-xl border border-outline text-outline font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
                  onClick={() => {
                    setStep("phone");
                    otpForm.reset();
                  }}
                >
                  Back
                </button>
                <button
                  disabled={isPending}
                  className="flex-1 h-[48px] bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 active:scale-[0.98] duration-150 cursor-pointer"
                  type="submit"
                >
                  {isPending ? (
                    "Verifying..."
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

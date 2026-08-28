"use client";

import { Controller, useForm } from "react-hook-form";
import { useState, Suspense } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { resetPassword } from "@/services/auth/auth.service";

type ResetPasswordValues = {
  phone: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

function ResetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPhone = searchParams.get("phone") || "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordValues>({
    defaultValues: {
      phone: defaultPhone,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      setLoading(true);
      const result = await resetPassword(
        data.phone,
        data.otp,
        data.newPassword,
      );
      if (!result.success) {
        toast.error(result.message ?? "Failed to reset password");

        if (
          result.message?.toLowerCase().includes("invalid") ||
          result.message?.toLowerCase().includes("expire")
        ) {
          setTimeout(() => {
            router.push("/forgot-password");
          }, 2000);
        }
        return;
      }

      toast.success("Password reset successfully 🎉");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      const errorMessage = err?.message ?? "Something went wrong";
      toast.error(errorMessage);

      if (
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("expire")
      ) {
        setTimeout(() => {
          router.push("/forgot-password");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter the 6-digit OTP sent to your phone and create a new password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="text"
              readOnly={!!defaultPhone}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 bg-gray-50 text-gray-600 ${
                errors.phone
                  ? "border-red-400 ring-red-100"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              {...register("phone", { required: "Phone is required" })}
            />
          </div>

          {/* OTP Section (Shadcn UI) */}
          <div className="flex flex-col items-center sm:items-start">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              6-Digit OTP
            </label>

            <Controller
              name="otp"
              control={control}
              rules={{
                required: "OTP is required",
                minLength: {
                  value: 6,
                  message: "OTP must be exactly 6 digits",
                },
              }}
              render={({ field }) => (
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    {/* w-12 h-12 এবং text-lg দিয়ে বক্সগুলো বড় ও স্পষ্ট করা হয়েছে */}
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            {errors.otp && (
              <p className="text-xs text-red-500 mt-2 font-medium">
                {errors.otp.message}
              </p>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                  errors.newPassword
                    ? "border-red-400 ring-red-100"
                    : "border-gray-300 focus:ring-emerald-500"
                }`}
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters required",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-400 ring-red-100"
                    : "border-gray-300 focus:ring-emerald-500"
                }`}
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Suspense wrapper
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600 h-8 w-8" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { ArrowLeft, Loader2, Phone } from "lucide-react"; // Mail এর বদলে Phone
import { forgotPassword } from "@/services/auth.service";

type ForgotPasswordValues = {
  phone: string;
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    defaultValues: { phone: "" },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setLoading(true);
      const result = await forgotPassword(data.phone);

      if (!result.success) {
        toast.error(result.message ?? "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your phone via SMS! 📱");

      // OTP
      setTimeout(() => {
        router.push(`/reset-password?phone=${data.phone}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-white/20 dark:border-slate-800/50">
        <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <Link
            href="/login"
            className="inline-flex w-fit items-center text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to login
          </Link>

          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-6">
            <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
              Enter your registered phone number and we will send you a 6-digit
              OTP via SMS to reset your password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>

                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  className={`block w-full pl-10 pr-3 py-3 bg-transparent border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                    errors.phone
                      ? "border-red-300 ring-red-100 dark:border-red-500/50 dark:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                  }`}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^01\d{9}$/,
                      message: "Invalid Bangladeshi phone number",
                    },
                  })}
                />
              </div>

              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </div>

        <div className="hidden md:flex relative p-8 lg:p-12 items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
          <Image
            src="https://res.cloudinary.com/di54jhuow/image/upload/v1772891060/Jahangirnagar_University_Logo_rixxyt.svg"
            alt="Jahangirnagar University Logo"
            width={400}
            height={400}
            className="object-contain w-full max-w-[250px] lg:max-w-[350px] drop-shadow-xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}

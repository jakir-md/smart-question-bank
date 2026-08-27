"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { loginUser } from "@/services/auth.service";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await loginUser(formData);

      if (!result?.success) {
        toast.error(result?.message || "Invalid credentials");
        return;
      }

      toast.success("Login successful 🎉");

      const role = result.role;
      const redirectUrl = getDefaultDashboardRoute(role);

      setTimeout(() => {
        router.push(`${redirectUrl}?loggedIn=true`);
      }, 500);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2  relative">
      <div className="relative z-10 w-full max-w-5xl  rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[550px]">
        {/* LEFT SIDE */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold">Please Login</h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                  <Mail className="h-5 w-5" /> {/* আইকন চেঞ্জ করা হয়েছে */}
                </div>
                <input
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-300 ring-red-100"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold  mb-1">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none  group-focus-within:text-emerald-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-300 ring-red-100"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center  hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 mt-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* RIGHT SIDE */}

        <div className="hidden md:flex relative items-center justify-center content-between bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl opacity-60"></div>

          <Image
            src="https://res.cloudinary.com/di54jhuow/image/upload/v1772891060/Jahangirnagar_University_Logo_rixxyt.svg"
            alt="JU Logo"
            width={300}
            height={300}
            className="object-cover relative z-10 drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

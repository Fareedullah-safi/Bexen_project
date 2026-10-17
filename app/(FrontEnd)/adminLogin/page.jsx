"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Missing information", {
        description: "Please enter your email and password.",
      });
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading("Verifying admin credentials...");

    try {
      const res = await axios.post("/api/admin/adminusers/login", {
        email: normalizedEmail,
        password,
      });

      if (!res.data?.success) {
        toast.error("Login failed", {
          id: toastId,
          description:
            res.data?.message || "Invalid email or password.",
        });
        return;
      }

      toast.success("Login successful", {
        id: toastId,
        description: "Welcome to your Bexon admin dashboard.",
      });

      router.replace("/admin");
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      if (status === 401) {
        toast.error("Invalid credentials", {
          id: toastId,
          description: "Your email or password is incorrect.",
        });
      } else if (status === 400) {
        toast.error("Invalid input", {
          id: toastId,
          description:
            serverMessage || "Please check your email and password.",
        });
      } else if (status === 429) {
        toast.error("Too many attempts", {
          id: toastId,
          description: "Please wait a moment before trying again.",
        });
      } else if (err.response) {
        toast.error("Login failed", {
          id: toastId,
          description:
            serverMessage || "The server could not process your request.",
        });
      } else {
        toast.error("Connection error", {
          id: toastId,
          description:
            "Unable to connect to the server. Check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center px-4 py-10 transition-colors duration-300 ${
        isDark ? "bg-[#0b1117]" : "bg-[#F7F9FC]"
      }`}
    >
      <div className="fixed top-5 right-5 z-10 flex items-center gap-3">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
            isDark
              ? "border-[#263442] bg-[#111a23] text-gray-200 hover:bg-[#16212c]"
              : "border-[#e4e7ec] bg-white text-[#344054] hover:bg-gray-50"
          }`}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
            isDark
              ? "border-[#263442] bg-[#111a23] text-gray-200 hover:bg-[#16212c]"
              : "border-[#e4e7ec] bg-white text-[#344054] hover:bg-gray-50"
          }`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <section className="w-full max-w-md">
        <div
          className={`overflow-hidden rounded-3xl border shadow-xl ${
            isDark
              ? "border-[#263442] bg-[#111a23] shadow-black/20"
              : "border-[#e4e7ec] bg-white shadow-slate-200/60"
          }`}
        >
          <div className="h-1.5 w-full bg-[#1e8a8a]" />

          <div className="px-6 py-9 sm:px-10 sm:py-11">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e8a8a]/10 ring-1 ring-[#1e8a8a]/20">
                <ShieldCheck
                  size={34}
                  strokeWidth={1.7}
                  className="text-[#1e8a8a]"
                />
              </div>

              <h1
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? "text-[#f2f4f7]" : "text-[#101828]"
                }`}
              >
                Admin Login
              </h1>

              <p
                className={`mt-2 text-sm leading-6 ${
                  isDark ? "text-[#98a6b5]" : "text-[#667085]"
                }`}
              >
                Welcome back! Sign in to manage your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className={`mb-2 block text-sm font-semibold ${
                    isDark ? "text-[#e4e7ec]" : "text-[#344054]"
                  }`}
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className={`absolute top-1/2 left-4 -translate-y-1/2 ${
                      isDark ? "text-[#8495a7]" : "text-[#98a2b3]"
                    }`}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full rounded-xl border py-3.5 pr-4 pl-11 text-sm transition outline-none placeholder:text-[#98a2b3] focus:border-[#1e8a8a] focus:ring-4 focus:ring-[#1e8a8a]/10 ${
                      isDark
                        ? "border-[#263442] bg-[#16212c] text-[#f2f4f7]"
                        : "border-[#e4e7ec] bg-white text-[#101828]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`mb-2 block text-sm font-semibold ${
                    isDark ? "text-[#e4e7ec]" : "text-[#344054]"
                  }`}
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className={`absolute top-1/2 left-4 -translate-y-1/2 ${
                      isDark ? "text-[#8495a7]" : "text-[#98a2b3]"
                    }`}
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full rounded-xl border py-3.5 pr-12 pl-11 text-sm transition outline-none placeholder:text-[#98a2b3] focus:border-[#1e8a8a] focus:ring-4 focus:ring-[#1e8a8a]/10 ${
                      isDark
                        ? "border-[#263442] bg-[#16212c] text-[#f2f4f7]"
                        : "border-[#e4e7ec] bg-white text-[#101828]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className={`absolute top-1/2 right-4 -translate-y-1/2 transition hover:text-[#1e8a8a] ${
                      isDark ? "text-[#8495a7]" : "text-[#98a2b3]"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1e8a8a]/15 transition duration-200 hover:bg-[#176f6f] focus:ring-4 focus:ring-[#1e8a8a]/20 focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Verifying admin..."
                  : "Sign in to dashboard"}
              </button>
            </form>

            <div
              className={`mt-7 border-t pt-5 text-center ${
                isDark ? "border-[#263442]" : "border-[#e4e7ec]"
              }`}
            >
              <p
                className={`text-xs ${
                  isDark ? "text-[#8495a7]" : "text-[#98a2b3]"
                }`}
              >
                Protected admin access · Bexon Dashboard
              </p>
            </div>
          </div>
        </div>

        <p
          className={`mt-5 text-center text-xs ${
            isDark ? "text-[#667788]" : "text-[#98a2b3]"
          }`}
        >
          © {new Date().getFullYear()} Bexon. All rights reserved.
        </p>
      </section>
    </main>
  );
}

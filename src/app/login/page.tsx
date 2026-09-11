"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { safeRedirectPath } from "@/lib/client-api";
import { GoogleLogin } from "@react-oauth/google";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = safeRedirectPath(searchParams.get("redirect"), "/dashboard");
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Welcome back to ScanUtsav!", "success");
        if (data.user?.role === "super_admin") {
          router.push("/admin");
        } else {
          router.push(redirectPath);
        }
      } else {
        showToast(data.error || "Invalid login credentials", "error");
      }
    } catch (err) {
      showToast("Login connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Welcome back to ScanUtsav!", "success");
        router.push(redirectPath);
      } else {
        showToast(data.error || "Google login failed", "error");
      }
    } catch (err) {
      showToast("Google login connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 font-sans bg-[#FAF9F6] text-slate-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group justify-center">
            <span className="text-3xl font-black tracking-tight text-slate-900 font-sans group-hover:scale-105 transition-transform duration-300">
              Scan<span className="text-[#F2810C]">Utsav</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 font-display">Welcome Back</h1>
          <p className="text-xs text-slate-600">Sign in to manage your event memory albums & QR standees</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-200 shadow-xl bg-white/95">
          <div className="space-y-4">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showToast("Google authentication failed", "error")}
                useOneTap
                theme="outline"
                size="large"
                width="350"
              />
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <div className="h-px bg-slate-200 flex-1" />
              <span>OR EMAIL SIGN IN</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="host@scanutsav.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#F2810C] hover:text-[#D97706] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F2810C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full text-xs font-bold bg-[#F2810C] hover:bg-[#D97706] text-white" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Account"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#F2810C] hover:text-[#D97706] font-bold underline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center p-6 text-slate-500 font-bold text-xs">
        Loading ScanUtsav Login...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

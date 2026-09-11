"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const { showToast } = useToast();

  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, text: "Weak", color: "bg-rose-500" };
    if (score <= 4) return { score: 2, text: "Good", color: "bg-amber-500" };
    return { score: 3, text: "Strong", color: "bg-emerald-600" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) {
      showToast("Please complete all fields", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast("Password reset successfully! Please login.", "success");
        router.push("/login");
      } else {
        showToast(data.error || "Failed to reset password", "error");
      }
    } catch (err) {
      showToast("Network error while resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center p-6 font-sans">
      <Link href="/login" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>
      
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-6 h-6 text-indigo-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2 font-display tracking-tight">Set New Password</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Enter the 6-digit code we sent to your email along with your new secure password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!prefilledEmail && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-[#F2810C] focus:border-[#F2810C] focus:bg-white outline-none transition-all shadow-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">6-Digit Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 123456"
              maxLength={6}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-center tracking-[0.5em] text-lg text-slate-900 font-black focus:ring-2 focus:ring-[#F2810C] focus:border-[#F2810C] focus:bg-white outline-none transition-all shadow-sm uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Must be at least 6 characters"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-[#F2810C] focus:border-[#F2810C] focus:bg-white outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#F2810C] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {newPassword && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 3) * 100}%` }} />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400 w-12 text-right">
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md py-6 text-base mt-2"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Secure My Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

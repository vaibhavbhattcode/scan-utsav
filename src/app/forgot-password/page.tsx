"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset" }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast("If an account exists, a reset code was sent.", "success");
        setSent(true);
      } else {
        showToast(data.error || "Failed to send reset code", "error");
      }
    } catch (err) {
      showToast("Network error while sending reset code", "error");
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
          <KeyRound className="w-6 h-6 text-indigo-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2 font-display tracking-tight">Forgot Password?</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Enter the email address associated with your account and we'll send you a 6-digit code to reset your password.
        </p>

        {sent ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-medium">
              We've sent a 6-digit verification code to <strong>{email}</strong>.
            </div>
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="block w-full">
              <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md py-6 text-base">
                Enter Reset Code
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-[#F2810C] focus:border-[#F2810C] focus:bg-white outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full bg-[#F2810C] hover:bg-[#D97706] text-white rounded-xl shadow-md py-6 text-base"
              disabled={loading}
            >
              {loading ? "Sending Code..." : "Send Reset Code"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const strength = getPasswordStrength(password);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Please complete all registration fields", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Account created successfully! Welcome to ScanUtsav 🎉", "success");
        router.push("/dashboard");
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch (err) {
      showToast("Registration connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const mockGoogleToken = "mock_google_id_token_scanutsav_2026";
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mockGoogleToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Google account registered successfully! 🎉", "success");
        router.push("/dashboard");
      } else {
        showToast(data.error || "Google registration failed", "error");
      }
    } catch (err) {
      showToast("Google registration error", "error");
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
              Scan<span className="text-marigold-500">Utsav</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 font-display">Create Host Account</h1>
          <p className="text-xs text-slate-600">Launch your event memory platform in under 60 seconds</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-200 shadow-xl bg-white/95">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleRegister}
            type="button"
            disabled={loading}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 rounded-xl border border-slate-200 text-xs flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span>Register with Google</span>
          </button>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <div className="h-px bg-slate-200 flex-1" />
            <span>OR REGISTER WITH EMAIL</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sethi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-marigold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-marigold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-marigold-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className="font-bold text-slate-900">{strength.text}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 3) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full shadow-glow-marigold text-xs font-bold bg-marigold-500 hover:bg-marigold-600 text-white" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account & Start Free"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-marigold-600 hover:text-marigold-700 font-bold underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Menu, X, ArrowRight, Shield, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  // Check current logged in user session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      showToast("Logged out successfully", "info");
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  // Do not render Navbar on Live TV Slideshow pages to avoid visual overlap
  if (pathname && pathname.includes("/slideshow")) {
    return null;
  }

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/solutions", label: "Solutions" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 print:hidden font-sans">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-2.5 flex items-center justify-between border border-slate-300 shadow-md shadow-slate-900/5 transition-all duration-300">
        {/* Brand Text Logo Only — High Visibility Light Theme Typography */}
        <Link href="/" className="flex flex-col group">
          <span className="text-2xl font-black tracking-tight text-slate-900 font-sans group-hover:scale-105 transition-transform duration-300">
            Scan<span className="text-[#F2810C]">Utsav</span>
          </span>
          <span className="text-[9px] text-slate-500 font-extrabold tracking-widest uppercase -mt-1 font-sans">
            Relive Forever
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-700">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-slate-900 bg-slate-100 font-bold border border-slate-300 shadow-sm"
                    : "hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions & Dynamic Auth State */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              {user.role === "super_admin" ? (
                <Link href="/admin">
                  <Button variant="gold" size="sm" className="text-xs font-bold bg-amber-500 text-white">
                    <Shield className="w-3.5 h-3.5 text-white" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-xs font-bold border border-slate-300 text-slate-900 bg-white hover:bg-slate-100">
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#F2810C]" />
                    <span>Host Dashboard</span>
                  </Button>
                </Link>
              )}

              <Button variant="glass" size="sm" onClick={handleLogout} className="text-xs border border-slate-300 text-slate-800 bg-slate-100 hover:bg-slate-200">
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs font-bold border border-slate-300 text-slate-900 bg-white hover:bg-slate-100 shadow-sm">
                  <User className="w-3.5 h-3.5 text-[#F2810C]" />
                  <span>Host Login</span>
                </Button>
              </Link>

              <Link href="/dashboard/events">
                <Button variant="primary" size="sm" className="text-xs font-black px-4 bg-[#F2810C] hover:bg-[#D97706] text-white border border-[#F2810C] shadow-md">
                  <span>Create Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-800 hover:text-slate-900 focus:outline-none rounded-xl bg-slate-100 border border-slate-300"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-5 bg-white/98 backdrop-blur-2xl rounded-2xl space-y-4 border border-slate-300 animate-in fade-in slide-in-from-top-5 duration-200 shadow-xl">
          <div className="flex flex-col gap-2 font-semibold text-slate-800">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2.5 px-4 rounded-xl text-xs transition-all ${
                    isActive
                      ? "bg-amber-50 text-[#F2810C] font-bold border border-amber-300"
                      : "hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-4 rounded-xl text-xs hover:bg-slate-100 text-slate-800"
            >
              FAQ & Support
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link href={user.role === "super_admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full text-xs font-black bg-[#F2810C] text-white">
                    {user.role === "super_admin" ? "Admin Console" : "Host Dashboard"}
                  </Button>
                </Link>
                <Button variant="glass" size="md" onClick={handleLogout} className="w-full text-xs border border-slate-300 text-slate-800 bg-slate-100">
                  Logout ({user.name})
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="md" className="w-full text-xs font-bold border border-slate-300 text-slate-900 bg-white">
                    Host Login / Sign In
                  </Button>
                </Link>
                <Link href="/dashboard/events" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full text-xs font-black bg-[#F2810C] text-white">
                    Create Free Event
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

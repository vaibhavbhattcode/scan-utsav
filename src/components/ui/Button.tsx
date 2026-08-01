"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "glass" | "danger" | "gold";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95 whitespace-nowrap";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-xs font-bold gap-2",
    lg: "px-7 py-3 text-sm font-bold gap-2.5",
    xl: "px-9 py-3.5 text-base font-black gap-3 rounded-2xl",
  };

  const variantStyles = {
    primary: "bg-[#F2810C] hover:bg-[#D97706] text-white font-bold shadow-md hover:shadow-lg border border-[#F2810C]",
    secondary: "bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold shadow-md border border-[#0F172A]",
    gold: "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white font-black shadow-md hover:brightness-105 border border-amber-600",
    outline: "border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold shadow-sm",
    glass: "bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm border border-rose-600",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

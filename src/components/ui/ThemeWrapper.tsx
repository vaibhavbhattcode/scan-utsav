"use client";

import React from "react";
import { computeThemeStyle } from "@/lib/theme-engine";

interface ThemeWrapperProps {
  templateId?: string;
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ templateId = "royal-wedding", children }) => {
  const theme = computeThemeStyle(templateId);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${theme.gradientClass} transition-colors duration-500`}
      style={{
        // Inject runtime CSS variables
        //@ts-ignore
        "--theme-primary": theme.primaryColor,
        "--theme-accent": theme.accentColor,
      }}
    >
      {children}
    </div>
  );
};

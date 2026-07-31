import { getTemplateById, EventTemplate } from "./templates";

export interface SystemThemeStyle {
  primaryColor: string;
  accentColor: string;
  gradientClass: string;
  cardBorderClass: string;
  badgeBgClass: string;
  fontAccent: string;
}

export function computeThemeStyle(templateId?: string): SystemThemeStyle {
  const template = getTemplateById(templateId || "royal-wedding");

  return {
    primaryColor: template.themeColor,
    accentColor: template.accentColor,
    gradientClass: template.bgGradient,
    cardBorderClass: `hover:border-[${template.themeColor}]/50`,
    badgeBgClass: `bg-[${template.themeColor}]/20 text-[${template.themeColor}]`,
    fontAccent: template.category === "wedding" ? "font-serif" : "font-sans",
  };
}

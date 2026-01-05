export const locales = ["en", "ru", "hy"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "hy";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  hy: "Հայերեն",
};



export const API_BASE_URL = "https://prime-auto-backend.vercel.app";




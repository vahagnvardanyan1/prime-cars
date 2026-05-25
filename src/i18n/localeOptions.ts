import type { Locale } from "@/i18n/config";
import { localeNames, locales } from "@/i18n/config";

export type LocaleOption = {
  locale: Locale;
  label: string;
  flag: string;
};

const getFlag = ({ locale }: { locale: Locale }) => {
  switch (locale) {
    case "en":
      return "🇺🇸";
    case "ru":
      return "🇷🇺";
    case "hy":
      return "🇦🇲";
    default:
      return "🌐";
  }
};

export const getLocaleOptions = () => {
  return locales.map((locale) => {
    const option: LocaleOption = {
      locale,
      label: localeNames[locale],
      flag: getFlag({ locale }),
    };

    return option;
  });
};



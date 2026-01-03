import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { defaultLocale, locales, type Locale } from "@/i18n/config";

export default getRequestConfig(
  async ({ requestLocale }: { requestLocale: Promise<string | undefined> }) => {
    const locale = ((await requestLocale) || defaultLocale) as Locale;

    if (!locales.includes(locale)) {
      notFound();
    }

    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
    };
  },
);



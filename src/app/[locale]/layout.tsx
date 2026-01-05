import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { SiteShell } from "@/components/SiteShell";
import { ThemeProvider } from "@/components/ThemeContext";

type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: Locale };
};

export const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }));
};

export const dynamicParams = false;

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const locale = params.locale as string;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <SiteShell>{children}</SiteShell>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
};

export default LocaleLayout;




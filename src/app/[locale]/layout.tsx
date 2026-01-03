import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import type { Locale } from "@/i18n/config";
import { SiteShell } from "@/components/SiteShell";
import { ThemeProvider } from "@/components/ThemeContext";

type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: Locale };
};

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      <ThemeProvider>
        <SiteShell>{children}</SiteShell>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
};

export default LocaleLayout;



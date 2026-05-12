import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import "@/app/globals.css";

import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { JsonLd } from "@/components/JsonLd";
import { MaintenancePage } from "@/components/MaintenancePage";
import { QueryProvider } from "@/contexts/QueryProvider";
import { SiteShell } from "@/components/SiteShell";
import { ThemeInitScript } from "@/components/ThemeInitScript";
import { ThemeProvider } from "@/components/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/contexts/UserContext";
import { isMaintenanceMode } from "@/lib/maintenance";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: Locale };
};

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export const dynamicParams = false;

// Explicit viewport so iOS Safari uses the device's physical width as the
// breakpoint reference (otherwise it falls back to a 980px virtual viewport,
// which makes Tailwind's `md:` utilities apply on phones — collapsing
// responsive `text-base md:text-sm` to 14px and triggering auto-zoom on inputs).
// `maximumScale`/`userScalable` intentionally left at browser defaults so users
// can still pinch-zoom for accessibility.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Layout-level metadata handles root-of-tree concerns ONLY: metadataBase,
// title.template, favicons, and the manifest. Page-specific title, description,
// canonical, and hreflang are emitted by each page's own `generateMetadata`
// (which merges over this). Keeping full home metadata here too would create
// redundancy on the home route where the layout + page both render for "/".
export const generateMetadata = async ({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> => {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "seo.home" });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | ${SITE_NAME}` },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
};

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const locale = params.locale as string;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  if (isMaintenanceMode()) {
    return (
      <html lang={locale} className="dark" suppressHydrationWarning>
        <head>
          <ThemeInitScript />
        </head>
        <body>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider>
              <MaintenancePage />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <JsonLd id="site" data={[organizationJsonLd(), websiteJsonLd(locale as Locale)]} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ThemeProvider>
              <UserProvider>
                <SiteShell>{children}</SiteShell>
                <Toaster />
              </UserProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;

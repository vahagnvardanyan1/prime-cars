import type { Metadata } from "next";

import { locales, type Locale, defaultLocale } from "@/i18n/config";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://primecars.am";

export const SITE_NAME = "Prime Cars";

export const DEFAULT_OG_IMAGE = "/og/default.png";

export const OG_IMAGE_DIMENSIONS = { width: 1200, height: 630 } as const;

// Map our locale codes to BCP47 locale strings Google uses in OG/hreflang.
export const OG_LOCALE: Record<Locale, string> = {
  hy: "hy_AM",
  en: "en_US",
  ru: "ru_RU",
};

// Build the canonical URL for a path within a given locale. The next-intl
// middleware uses `localePrefix: "always"`, so every canonical URL includes
// the locale segment (`/hy`, `/en`, `/ru`) — including the default Armenian.
export const buildCanonicalUrl = (path: string = "", locale: Locale = defaultLocale) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const trimmed = cleanPath === "/" ? "" : cleanPath;
  return `${SITE_URL}/${locale}${trimmed}`;
};

// Build hreflang alternates for a given path. x-default points at the
// Armenian (default) locale's prefixed URL.
export const buildLanguageAlternates = (path: string = "") => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const trimmed = cleanPath === "/" ? "" : cleanPath;
  const alternates: Record<string, string> = {};
  for (const l of locales) {
    alternates[l] = `${SITE_URL}/${l}${trimmed}`;
  }
  alternates["x-default"] = `${SITE_URL}/${defaultLocale}${trimmed}`;
  return alternates;
};

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  locale?: Locale;
  ogImage?: string;
  // Next's Metadata type only allows "website" | "article" at the top level —
  // "product.item" support would need to go through `other: { "og:type": ... }`.
  // We express product-level info via JSON-LD Vehicle schema instead.
  ogType?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
};

export const createPageMetadata = ({
  title,
  description,
  path = "",
  locale = defaultLocale,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords,
  noIndex = false,
  noFollow = false,
}: CreatePageMetadataOptions): Metadata => {
  const canonical = buildCanonicalUrl(path, locale);
  const languages = buildLanguageAlternates(path);
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  // NB: `metadataBase` is intentionally NOT set here — it belongs on the root
  // (locale) layout so it's declared once. Every page metadata merges upward
  // and inherits it from there.
  return {
    title,
    description,
    keywords,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: ogType,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_DIMENSIONS.width,
          height: OG_IMAGE_DIMENSIONS.height,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    verification:{
      google:'F4kBhWdm_HcUK5bfLAHiWZSPvzqs8eRlLafm81NZHZw'
    }
};
};

export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    // Some crawlers only read the googleBot-specific directives. Mirror the
    // top-level values so they see a consistent noindex signal.
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

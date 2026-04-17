import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://primecars.am";

export const SITE_NAME = "Prime Cars";

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  locale?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export const createPageMetadata = ({
  title,
  description,
  path = "",
  locale = "hy",
  ogImage = "/og/default.png",
  noIndex = false,
}: CreatePageMetadataOptions): Metadata => {
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title,
    description,
    ...(noIndex && {
      robots: { index: false, follow: true },
    }),
    alternates: {
      canonical: url,
      languages: {
        hy: `${SITE_URL}/hy${path}`,
        en: `${SITE_URL}/en${path}`,
        ru: `${SITE_URL}/ru${path}`,
        "x-default": `${SITE_URL}/hy${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
};

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

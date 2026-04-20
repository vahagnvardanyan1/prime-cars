import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { HomePage } from "@/components/pages/HomePage";
import type { Locale } from "@/i18n/config";
import { createPageMetadata } from "@/lib/seo";

type PageProps = { params: { locale: Locale } };

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    locale,
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  });
};

const Page = async () => {
  return <HomePage />;
};

export default Page;

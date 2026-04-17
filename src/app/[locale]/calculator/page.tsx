import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CalculatorPage } from "@/components/pages/CalculatorPage";
import type { Locale } from "@/i18n/config";
import { createPageMetadata } from "@/lib/seo";

type PageProps = { params: { locale: Locale } };

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "seo.calculator" });
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/calculator",
    locale,
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  });
};

const Page = () => {
  return <CalculatorPage />;
};

export default Page;

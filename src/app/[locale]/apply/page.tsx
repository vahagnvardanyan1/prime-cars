import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApplyPage } from "@/components/pages/ApplyPage";
import type { Locale } from "@/i18n/config";
import { createPageMetadata } from "@/lib/seo";

type PageProps = { params: { locale: Locale } };

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "seo.apply" });
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/apply",
    locale,
  });
};

export default function Page() {
  return <ApplyPage />;
}

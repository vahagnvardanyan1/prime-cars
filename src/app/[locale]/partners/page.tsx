import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PartnersPage } from "@/components/pages/PartnersPage";
import type { Locale } from "@/i18n/config";
import { createPageMetadata } from "@/lib/seo";

type PageProps = { params: { locale: Locale } };

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "seo.partners" });
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/partners",
    locale,
  });
};

const Page = () => {
  return <PartnersPage />;
};

export default Page;

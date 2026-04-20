"use client";

import { useTranslations } from "next-intl";
import { TextReveal } from "./TextReveal";

export function PopularDealsHeader() {
  const t = useTranslations();

  return (
    <div className="text-center mb-12">
      <TextReveal
        text={t("home.popularDeals.title")}
        as="h2"
        className="mb-4"
      />
      <TextReveal
        text={t("home.popularDeals.description")}
        as="p"
        className="max-w-3xl mx-auto"
        delay={0.3}
      />
    </div>
  );
}

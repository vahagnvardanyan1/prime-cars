"use client";

import { useTranslations } from "next-intl";

import { ImportCalculator } from "@/components/ImportCalculator";

export const AdminCalculatorPage = () => {
  const t = useTranslations();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {t("admin.headers.calculatorTitle")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("admin.headers.calculatorSubtitle")}
        </p>
      </div>
      <ImportCalculator showNotice={false} disablePartnerRestrictions={true} />
    </div>
  );
};


"use client";

import { useTranslations } from "next-intl";
import { FiTarget, FiMonitor } from "react-icons/fi";

export function AboutSection() {
  const t = useTranslations();

  return (
    <div className="space-y-20">
      {/* Intro */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center mb-8">{t("home.aboutUs.title")}</h2>
        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>{t("home.aboutUs.intro")}</p>
          <p>{t("home.aboutUs.warehouses")}</p>
          <p>{t("home.aboutUs.access")}</p>
          <p>{t("home.aboutUs.assistance")}</p>
        </div>
      </div>

      {/* Team & Trust */}
      <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-white/5 rounded-2xl p-8 lg:p-12 border border-gray-200 dark:border-white/10">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {t("home.aboutUs.team")}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {t("home.aboutUs.advantages")}
        </p>
        <p className="mt-6 text-lg font-medium text-[#429de6]">
          {t("home.aboutUs.dream")}
        </p>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6">
          {t("home.aboutUs.whyTitle")}
        </h3>
        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>{t("home.aboutUs.whyDescription")}</p>
          <p>{t("home.aboutUs.whyBusiness")}</p>
          <p>{t("home.aboutUs.whyPrice")}</p>
        </div>
      </div>

      {/* Mission & Platform */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10">
          <FiTarget className="w-8 h-8 text-[#429de6] mb-4" />
          <h3 className="mb-3">{t("home.aboutUs.missionTitle")}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("home.aboutUs.missionDescription")}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10">
          <FiMonitor className="w-8 h-8 text-[#429de6] mb-4" />
          <h3 className="mb-3">{t("home.aboutUs.platformTitle")}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("home.aboutUs.platformDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TextReveal } from "./TextReveal";
import { FiTarget, FiMonitor } from "react-icons/fi";

export function AboutSection() {
  const t = useTranslations();

  return (
    <div className="space-y-20">
      {/* Intro */}
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <TextReveal
          text={t("home.aboutUs.title")}
          as="h2"
          className="text-center mb-8"
        />
        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>{t("home.aboutUs.intro")}</p>
          <p>{t("home.aboutUs.warehouses")}</p>
          <p>{t("home.aboutUs.access")}</p>
          <p>{t("home.aboutUs.assistance")}</p>
        </div>
      </motion.div>

      {/* Team & Trust */}
      <motion.div
        className="max-w-4xl mx-auto bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-8 lg:p-12 border border-gray-200 dark:border-white/[0.08]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {t("home.aboutUs.team")}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {t("home.aboutUs.advantages")}
        </p>
        <p className="mt-6 text-lg font-medium text-[#429de6]">
          {t("home.aboutUs.dream")}
        </p>
      </motion.div>

      {/* Why Choose Us */}
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <TextReveal
          text={t("home.aboutUs.whyTitle")}
          as="h3"
          className="text-2xl font-bold text-center mb-6"
        />
        <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>{t("home.aboutUs.whyDescription")}</p>
          <p>{t("home.aboutUs.whyBusiness")}</p>
          <p>{t("home.aboutUs.whyPrice")}</p>
        </div>
      </motion.div>

      {/* Mission & Platform */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.div
          className="p-6 rounded-2xl border border-gray-200 dark:border-white/[0.08]"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <FiTarget className="w-8 h-8 text-[#429de6] mb-4" />
          <h3 className="mb-3">{t("home.aboutUs.missionTitle")}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("home.aboutUs.missionDescription")}
          </p>
        </motion.div>

        <motion.div
          className="p-6 rounded-2xl border border-gray-200 dark:border-white/[0.08]"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FiMonitor className="w-8 h-8 text-[#429de6] mb-4" />
          <h3 className="mb-3">{t("home.aboutUs.platformTitle")}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("home.aboutUs.platformDescription")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

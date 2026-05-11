"use client";

import { motion } from "motion/react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function HeroContent({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <div className={`text-center lg:text-left max-w-full break-words ${className ?? ""}`}>
      <motion.h1
        className="mb-4 text-gray-900 dark:text-white text-2xl sm:text-3xl lg:text-4xl"
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {t("home.hero.title")}
      </motion.h1>

      <motion.p
        className="mb-8 text-base sm:text-lg text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.25,
          ease: "easeOut",
        }}
      >
        {t("home.hero.description")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.4,
          ease: "easeOut",
        }}
      >
        <Link
          href="/calculator"
          className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-colors hover:shadow-lg hover:shadow-blue-500/20 mx-auto lg:mx-0 block lg:inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
        >
          {t("home.hero.primaryCta")}
        </Link>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function HeroLogo() {
  const t = useTranslations();

  return (
    <motion.div
      className="relative flex items-start justify-center -mt-64"
      initial={{ y: -120, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        duration: 1,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Image
        src="/hero-animateds/container.png"
        alt={t("home.hero.heroImageAlt")}
        className="w-full h-auto max-h-[60vh] lg:max-h-[95vh] object-contain relative z-10"
        width={600}
        height={975}
        priority
      />
    </motion.div>
  );
}

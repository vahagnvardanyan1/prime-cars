"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function HeroLogo() {
  const t = useTranslations();

  return (
    <motion.div
      className="relative flex items-start justify-center -mt-64"
      initial={{ y: -200, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        duration: 2.5,
        delay: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Image
        src="/hero-animateds/container.png"
        alt={t("home.hero.heroImageAlt")}
        className="w-full h-auto max-h-[50vh] lg:max-h-[80vh] object-contain relative z-10"
        width={600}
        height={975}
        priority
      />
    </motion.div>
  );
}

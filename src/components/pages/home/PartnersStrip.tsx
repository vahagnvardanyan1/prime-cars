"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { TextReveal } from "./TextReveal";

const partners = [
  { name: "Partner 1", logo: "/our-partners/1.png" },
  { name: "Partner 2", logo: "/our-partners/2.png" },
  { name: "Partner 3", logo: "/our-partners/3.png" },
  { name: "Partner 4", logo: "/our-partners/4.png" },
  { name: "Partner 5", logo: "/our-partners/5.png" },
  { name: "Partner 6", logo: "/our-partners/6.png" },
  { name: "Partner 7", logo: "/our-partners/7.png" },
  { name: "Partner 8", logo: "/our-partners/8.png" },
  { name: "Partner 9", logo: "/our-partners/9.png" },
  { name: "Partner 10", logo: "/our-partners/10.png" },
];

export function PartnersStrip() {
  const t = useTranslations();

  return (
    <div className="text-center">
      <TextReveal
        text={t("home.ourPartners.title")}
        as="h2"
        className="mb-3"
      />

      <TextReveal
        text={t("home.ourPartners.description")}
        as="p"
        className="max-w-2xl mx-auto mb-12 text-gray-600 dark:text-gray-400"
        delay={0.3}
        wordDelay={0.03}
      />

      <div className="relative overflow-hidden group">
        <div className="flex w-max animate-scroll group-hover:[animation-play-state:paused]">
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 px-8 lg:px-12 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={60}
                className="h-10 lg:h-12 w-auto object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

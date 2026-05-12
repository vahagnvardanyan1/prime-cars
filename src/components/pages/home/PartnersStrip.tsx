"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TextReveal } from "./TextReveal";

const partners = [
  { name: "Maersk sea freight partner", logo: "/our-partners/1.png", darkLogo: "/our-partners/1-dark.png" },
  { name: "MSC sea freight partner", logo: "/our-partners/2.png", darkLogo: "/our-partners/2-dark.png" },
  { name: "COSCO Shipping partner", logo: "/our-partners/3.png", darkLogo: "/our-partners/3-dark.png" },
  { name: "Hapag-Lloyd partner", logo: "/our-partners/4.png", darkLogo: "/our-partners/4-dark.png" },
  { name: "ONE Ocean Network Express partner", logo: "/our-partners/5.png", darkLogo: "/our-partners/5-dark.webp" },
  { name: "ZIM shipping partner", logo: "/our-partners/6.png", darkLogo: null },
  { name: "CMA CGM sea freight partner", logo: "/our-partners/7.png", darkLogo: null },
  { name: "Yang Ming Marine partner", logo: "/our-partners/8.png", darkLogo: "/our-partners/8-dark.png" },
  { name: "OOCL shipping partner", logo: "/our-partners/9.png", darkLogo: null },
  { name: "Evergreen shipping partner", logo: "/our-partners/10.png", darkLogo: "/our-partners/10-dark.png" },
];

export function PartnersStrip() {
  const t = useTranslations();
  const doubled = useMemo(() => [...partners, ...partners], []);

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
      />

      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max hover:[animation-play-state:paused] animate-scroll">
          {doubled.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 px-8 lg:px-12 flex items-center justify-center"
            >
              {partner.darkLogo ? (
                <>
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={160}
                    height={60}
                    className="h-10 lg:h-12 w-auto object-contain pointer-events-none select-none dark:hidden"
                    draggable={false}
                  />
                  <Image
                    src={partner.darkLogo}
                    alt={partner.name}
                    width={160}
                    height={60}
                    className="h-10 lg:h-12 w-auto object-contain pointer-events-none select-none hidden dark:block"
                    draggable={false}
                  />
                </>
              ) : (
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={160}
                  height={60}
                  className="h-10 lg:h-12 w-auto object-contain pointer-events-none select-none dark:brightness-0 dark:invert"
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

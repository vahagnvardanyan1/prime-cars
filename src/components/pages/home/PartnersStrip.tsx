"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TextReveal } from "./TextReveal";

// Alt text is used by Google image search + accessibility. If your designer has
// a different mapping between the numbered file and the actual auction/carrier
// name, update this list — the file order should match your partner contracts.
const partners = [
  { name: "COPART auto auction partner", logo: "/our-partners/1.png" },
  { name: "IAAI auto auction partner", logo: "/our-partners/2.png" },
  { name: "Manheim auto auction partner", logo: "/our-partners/3.png" },
  { name: "ADESA auto auction partner", logo: "/our-partners/4.png" },
  { name: "ACV Auctions partner", logo: "/our-partners/5.png" },
  { name: "Maersk sea freight partner", logo: "/our-partners/6.png" },
  { name: "MSC sea freight partner", logo: "/our-partners/7.png" },
  { name: "CMA CGM sea freight partner", logo: "/our-partners/8.png" },
  { name: "Prime Cars shipping partner", logo: "/our-partners/9.png" },
  { name: "Prime Cars logistics partner", logo: "/our-partners/10.png" },
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
        wordDelay={0.03}
      />

      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max hover:[animation-play-state:paused] animate-scroll">
          {doubled.map((partner, i) => (
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

"use client";

import { useTranslations } from "next-intl";
import { TextReveal } from "./TextReveal";
import { type IconType } from "react-icons";
import {
  FiFileText,
  FiSearch,
  FiKey,
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiAnchor,
  FiPackage,
  FiHeadphones,
  FiMonitor,
  FiCamera,
  FiClipboard,
  FiCheckCircle,
  FiFilm,
} from "react-icons/fi";
import { MdFlight, MdLocalShipping } from "react-icons/md";

const services: { key: string; icon: IconType }[] = [
  { key: "contract", icon: FiFileText },
  { key: "historyCheck", icon: FiSearch },
  { key: "auctionAccess", icon: FiKey },
  { key: "purchasing", icon: FiShoppingCart },
  { key: "groundShipping", icon: FiTruck },
  { key: "insurance", icon: FiShield },
  { key: "seaShipping", icon: FiAnchor },
  { key: "customs", icon: FiPackage },
  { key: "support", icon: FiHeadphones },
  { key: "dashboard", icon: FiMonitor },
  { key: "extraMedia", icon: FiCamera },
  { key: "inspection", icon: FiClipboard },
  { key: "cover", icon: FiCheckCircle },
  { key: "windowFilm", icon: FiFilm },
  { key: "airFreight", icon: MdFlight },
  { key: "cargoShipping", icon: MdLocalShipping },
];

export function ServicesSection() {
  const t = useTranslations();

  return (
    <div>
      <div className="text-center mb-10 max-w-4xl mx-auto">
        <TextReveal
          text={t("home.services.description")}
          as="p"
          className="text-lg text-gray-600 dark:text-gray-400"
          delay={0.3}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.key}
              className="group p-5 rounded-2xl border border-gray-200 dark:border-white/[0.08] hover:border-[#429de6]/30 dark:hover:border-[#429de6]/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="w-14 h-14 rounded-lg bg-[#429de6]/10 flex items-center justify-center mb-3 group-hover:bg-[#429de6]/20 transition-colors">
                <Icon className="w-8 h-8 text-[#429de6]" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">
                {t(`home.services.items.${service.key}.title`)}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {t(`home.services.items.${service.key}.description`)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

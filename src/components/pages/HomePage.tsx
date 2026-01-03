"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Package, Users, Wrench } from "lucide-react";

import { ImportCalculator } from "@/components/ImportCalculator";
import { Link } from "@/i18n/routing";

export const HomePage = () => {
  const t = useTranslations();

  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-gray-50 dark:bg-black min-h-[90vh] flex items-center transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] dark:opacity-100 opacity-0 transition-opacity duration-300">
          <div className="glow-effect"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-gray-900 dark:text-white">
                {t("home.hero.title")}
              </h1>

              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                {t("home.hero.description")}
              </p>

              <Link
                href="/calculator"
                className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 mx-auto lg:mx-0 block lg:inline-block"
              >
                {t("home.hero.primaryCta")}
              </Link>
            </div>

            <div className="relative">
              <Image
                src="https://cdn-editing-temp.picsart.com/editing-temp-landings/83f467c7-128c-4e99-adc6-817310e2a1ed.png"
                alt={t("home.hero.heroImageAlt")}
                className="w-full h-auto relative z-10"
                width={1000}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t("home.popularDeals.title")}</h2>
            <p className="max-w-3xl mx-auto">
              {t("home.popularDeals.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                year: "2022",
                name: "BMW 3 Series Coupé 2.0i",
                transmissionKey: "automatic",
                bodyKey: "coupe",
                fuelKey: "petrol",
                price: "$204.91",
                period: t("home.popularDeals.periodPerDay"),
                image:
                  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
              },
              {
                year: "2024",
                name: "New Tesla Model S Plaid",
                transmissionKey: "automatic",
                bodyKey: "sedan",
                fuelKey: "electric",
                price: "$321.41",
                period: t("home.popularDeals.periodPerDay"),
                image:
                  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
              },
              {
                year: "2022",
                name: "Chevy Camaro ZL1",
                transmissionKey: "automatic",
                bodyKey: "sports",
                fuelKey: "petrol",
                price: "$266.51",
                period: t("home.popularDeals.periodPerDay"),
                image:
                  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
              },
            ].map((car) => (
              <div
                key={`${car.year}-${car.name}`}
                className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-gray-900 dark:text-white text-xs border border-gray-200 dark:border-white/20">
                    {car.year}
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-[#429de6] transition-colors border border-gray-200 dark:border-white/20">
                    <span className="text-gray-900 dark:text-white text-lg">
                      ♥
                    </span>
                  </div>
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2">{car.name}</h3>
                  <p className="text-sm mb-4">
                    {t(`home.popularDeals.specs.${car.transmissionKey}`)} •{" "}
                    {t(`home.popularDeals.specs.${car.bodyKey}`)} •{" "}
                    {t(`home.popularDeals.specs.${car.fuelKey}`)}
                  </p>
                  <div className="flex items-end justify-between border-t border-gray-200 dark:border-white/10 pt-4">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                        {t("home.popularDeals.rentalPriceLabel")}
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {car.price}
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {car.period}
                        </span>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all text-sm"
                      type="button"
                    >
                      {t("home.popularDeals.seeTourDetails")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="mb-4">{t("home.service.title")}</h2>
            <p className="max-w-3xl mx-auto">
              {t("home.service.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto border border-gray-200 dark:border-white/10">
                <Wrench className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="mb-3">{t("home.service.cards.maintenance.title")}</h3>
              <p className="mb-6 text-sm">
                {t("home.service.cards.maintenance.description")}
              </p>
              <button
                className="text-gray-900 dark:text-white text-sm hover:text-[#429de6] transition-colors"
                type="button"
              >
                {t("home.service.readMore")}
              </button>
            </div>

            <div className="group p-8 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto border border-gray-200 dark:border-white/10">
                <Users className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="mb-3">{t("home.service.cards.customer.title")}</h3>
              <p className="mb-6 text-sm">
                {t("home.service.cards.customer.description")}
              </p>
              <button
                className="text-gray-900 dark:text-white text-sm hover:text-[#429de6] transition-colors"
                type="button"
              >
                {t("home.service.readMore")}
              </button>
            </div>

            <div className="group p-8 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto border border-gray-200 dark:border-white/10">
                <Package className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="mb-3">{t("home.service.cards.parts.title")}</h3>
              <p className="mb-6 text-sm">
                {t("home.service.cards.parts.description")}
              </p>
              <button
                className="text-gray-900 dark:text-white text-sm hover:text-[#429de6] transition-colors"
                type="button"
              >
                {t("home.service.readMore")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t("home.importCosts.title")}</h2>
            <p className="max-w-3xl mx-auto">
              {t("home.importCosts.description")}
            </p>
          </div>

          <ImportCalculator />
        </div>
      </section>
    </div>
  );
};

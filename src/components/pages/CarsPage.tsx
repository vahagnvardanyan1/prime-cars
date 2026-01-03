"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  Calendar,
  Fuel,
  Gauge,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { carsData } from "@/data/cars";
import { filterCars } from "@/lib/cars/filterCars";

export const CarsPage = () => {
  const t = useTranslations();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<
    "all" | "under-100k" | "100k-150k" | "over-150k"
  >("all");

  const brands = useMemo(() => {
    const uniqueBrands = new Set(carsData.map((c) => c.brand));
    return ["all", ...Array.from(uniqueBrands)];
  }, []);

  const filteredCars = useMemo(() => {
    return filterCars({ cars: carsData, searchTerm, selectedBrand, priceRange });
  }, [priceRange, searchTerm, selectedBrand]);

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <section className="bg-gradient-to-b from-gray-100 dark:from-[#111111] to-white dark:to-black py-16 border-b border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          <h1 className="text-gray-900 dark:text-white mb-2">{t("cars.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("cars.subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-6 sticky top-28 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-gray-900 dark:text-white" />
                <h3 className="text-gray-900 dark:text-white">{t("cars.filters.title")}</h3>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("cars.filters.searchLabel")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("cars.filters.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("cars.filters.brandLabel")}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand === "all" ? t("cars.filters.allBrands") : brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("cars.filters.priceRangeLabel")}
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="all">{t("cars.filters.allPrices")}</option>
                  <option value="under-100k">{t("cars.filters.under100k")}</option>
                  <option value="100k-150k">{t("cars.filters.between100And150")}</option>
                  <option value="over-150k">{t("cars.filters.over150k")}</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedBrand("all");
                  setPriceRange("all");
                }}
                className="w-full py-3 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                type="button"
              >
                {t("cars.filters.reset")}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {t("cars.results.found", { count: filteredCars.length })}
              </p>
              <select className="px-4 py-2 bg-white dark:bg-[#111111] border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent">
                <option>{t("cars.results.sort.priceLowToHigh")}</option>
                <option>{t("cars.results.sort.priceHighToLow")}</option>
                <option>{t("cars.results.sort.yearNewest")}</option>
                <option>{t("cars.results.sort.yearOldest")}</option>
              </select>
            </div>

            {filteredCars.length === 0 ? (
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-12 text-center transition-colors duration-300">
                <p className="text-gray-600 dark:text-gray-400">
                  {t("cars.results.noResults")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 overflow-hidden group hover:border-[#429de6]/50 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-black">
                      <Image
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-gray-900 dark:text-white group-hover:text-[#429de6] transition-colors">
                            {car.brand} {car.model}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{car.year}</span>
                          </div>
                        </div>
                        <div className="text-[#429de6]">${car.price.toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{car.location}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-300 dark:border-white/10">
                        <div className="text-center">
                          <Gauge className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                          <div className="text-gray-900 dark:text-white text-sm">{car.hp} HP</div>
                        </div>
                        <div className="text-center">
                          <Fuel className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                          <div className="text-gray-900 dark:text-white text-sm">{car.fuel}</div>
                        </div>
                        <div className="text-center text-gray-900 dark:text-white text-sm">
                          {car.transmission}
                        </div>
                      </div>

                      <button
                        className="w-full mt-4 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all"
                        type="button"
                      >
                        {t("cars.results.viewDetails")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

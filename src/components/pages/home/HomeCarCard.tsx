"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import type { CarCategory, HomeCar } from "@/lib/public/types";

type HomeCarCardProps = {
  car: HomeCar;
  category: CarCategory;
};

const getCategoryBadgeStyles = (category: CarCategory): string => {
  const styles: Record<CarCategory, string> = {
    current:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    coming:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    order:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/20",
  };
  return styles[category];
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

export const HomeCarCard = ({ car, category }: HomeCarCardProps) => {
  const t = useTranslations("home.carSections");

  return (
    <div className="group relative bg-white dark:bg-[#111111] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-yellow-400 dark:hover:border-[#429de6] hover:bg-yellow-50 dark:hover:bg-[#429de6]/10 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-200 dark:hover:shadow-[#429de6]/5">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
        {/* Year Badge */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 dark:bg-black/60 backdrop-blur-md rounded-full text-gray-900 dark:text-white text-xs font-medium border border-gray-200/50 dark:border-white/10 z-10">
          {car.year}
        </div>

        {/* Category Badge */}
        <div
          className={`absolute top-4 right-4 px-3 py-1.5 backdrop-blur-md rounded-full text-xs font-medium border z-10 ${getCategoryBadgeStyles(category)}`}
        >
          {t(`badges.${category}`)}
        </div>

        {/* Progress Bar for Coming Cars */}
        {category === "coming" && car.shippingProgress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{ width: `${car.shippingProgress}%` }}
            />
          </div>
        )}

        <Image
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand & Model */}
        <div className="mb-3">
          <p className="text-xs text-[#429de6] font-medium uppercase tracking-wider mb-1">
            {car.brand}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {car.model}
          </h3>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
          {car.engine && (
            <>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {car.engine}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
            </>
          )}
          {car.horsepower && (
            <>
              <span>{car.horsepower} HP</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
            </>
          )}
          {car.fuelType && <span>{car.fuelType}</span>}
        </div>

        {/* ETA for Coming Cars */}
        {category === "coming" && car.estimatedArrival && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {t("eta")}: {car.estimatedArrival}
            </span>
          </div>
        )}

        {/* Location for Current Cars */}
        {category === "current" && car.location && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{car.location}</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
              {category === "order" ? t("startingFrom") : t("price")}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(car.priceUsd)}
            </p>
          </div>

          <button className="px-4 py-2 bg-[#429de6] hover:bg-[#3a8acc] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#429de6]/25 active:scale-95">
            {category === "order" ? t("requestCta") : t("viewCta")}
          </button>
        </div>
      </div>
    </div>
  );
};

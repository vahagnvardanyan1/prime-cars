"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import type { Car, CarCategory } from "@/lib/cars/types";
import { translateEngineType, translateFuelType } from "@/lib/utils/translateVehicleSpecs";

type CarCardProps = {
  car: Car;
};

const getCategoryStyles = (category: CarCategory): string => {
  const styles: Record<CarCategory, string> = {
    AVAILABLE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    ONROAD: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    TRANSIT: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
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

export const CarCard = ({ car }: CarCardProps) => {
  const t = useTranslations("carsPage");
  const tCarDetails = useTranslations("carDetails");
  const router = useRouter();

  const handleClick = () => {
    router.push(`/cars/${car.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-[#429de6]/30 dark:hover:border-[#429de6]/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
        {/* Year Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-black/70 backdrop-blur-md rounded-lg text-gray-900 dark:text-white text-xs font-semibold z-10">
          {car.year}
        </div>

        {/* Category Badge */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 backdrop-blur-md rounded-lg text-xs font-semibold z-10 ${getCategoryStyles(car.category)}`}
        >
          {car.category === "AVAILABLE" && tCarDetails("badges.available")}
          {car.category === "ONROAD" && tCarDetails("badges.arriving")}
          {car.category === "TRANSIT" && tCarDetails("badges.order")}
        </div>

        <Image
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand & Model */}
        <div className="mb-3">
          <p className="text-xs text-[#429de6] font-medium uppercase tracking-wide mb-1">
            {car.brand}
          </p>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {car.model}
          </h3>
        </div>

        {/* Specs Row */}
        {(car.engine || car.horsepower || car.fuelType) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
            {car.engine && (
              <>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {translateEngineType(car.engine, tCarDetails)}
                </span>
                {(car.horsepower || car.fuelType) && <span className="text-gray-300 dark:text-gray-600">•</span>}
              </>
            )}
            {car.horsepower && (
              <>
                <span>{car.horsepower} {tCarDetails("horsepowerUnit")}</span>
                {car.fuelType && <span className="text-gray-300 dark:text-gray-600">•</span>}
              </>
            )}
            {car.fuelType && <span>{translateFuelType(car.fuelType, tCarDetails)}</span>}
          </div>
        )}

        {/* Location for AVAILABLE Cars */}
        {car.category === "AVAILABLE" && car.location && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{car.location}</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              {car.category === "TRANSIT" ? t("startingFrom") : t("price")}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(car.priceUsd)}
            </p>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="px-4 py-2 bg-[#429de6] hover:bg-[#3a8acc] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
          >
            {car.category === "TRANSIT" ? t("requestCta") : t("viewCta")}
          </button>
        </div>
      </div>
    </div>
  );
};

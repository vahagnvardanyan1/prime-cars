"use client";

import React, { useEffect, useState, memo } from "react";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { translateFuelType, translateTransmission } from "@/lib/utils/translateVehicleSpecs";

import { Container } from "@/components/layouts";
import { CarCard } from "@/components/pages/cars/CarCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCarsPage } from "@/hooks/useCarsPage";
import type { Car, CarCategory } from "@/lib/cars/types";

type SortOption = "price-asc" | "price-desc" | "year-newest" | "year-oldest";
type ViewMode = "grid" | "list";

const LoadingSkeleton = memo(({ viewMode }: { viewMode: ViewMode }) => {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl p-4 animate-pulse"
          >
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-48 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                  <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-28" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111111] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-pulse"
        >
          <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800" />
          <div className="p-6 space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
LoadingSkeleton.displayName = "LoadingSkeleton";

const CarListItem = memo(({ car }: { car: Car }) => {
  const t = useTranslations("carsPage");
  const tCarDetails = useTranslations("carDetails");
  const router = useRouter();

  const handleClick = () => {
    router.push(`/cars/${car.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const getCategoryBadge = () => {
    switch (car.category) {
      case "AVAILABLE":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            {tCarDetails("badges.available")}
          </span>
        );
      case "ONROAD":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
            {tCarDetails("badges.arriving")}
          </span>
        );
      case "TRANSIT":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-[#429de6]/20 text-blue-700 dark:text-[#429de6]">
            {tCarDetails("badges.order")}
          </span>
        );
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl hover:border-yellow-400 dark:hover:border-[#429de6] hover:bg-yellow-50 dark:hover:bg-[#429de6]/10 transition-all duration-300 hover:shadow-lg overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
    >
      <div className="flex gap-6 p-4">
        {/* Image */}
        <div className="flex-shrink-0 w-48 h-32 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden">
          <img
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{car.year}</p>
              </div>
              {getCategoryBadge()}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{car.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{car.horsepower} {tCarDetails("horsepowerUnit")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>{translateFuelType(car.fuelType, tCarDetails)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{translateTransmission(car.transmission, tCarDetails)}</span>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${car.priceUsd.toLocaleString()}
              </p>
            </div>
            <button className="px-6 py-2 bg-[#429de6] hover:bg-[#3a8acc] text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95">
              {t("viewCta")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
CarListItem.displayName = "CarListItem";

const EmptyState = memo(({ category }: { category: CarCategory }) => {
  const t = useTranslations("carsPage.empty");

  const getTranslationKey = () => {
    switch (category) {
      case "AVAILABLE":
        return "current";
      case "ONROAD":
        return "arriving";
      case "TRANSIT":
        return "order";
    }
  };

  const getIcon = () => {
    switch (category) {
      case "AVAILABLE":
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "ONROAD":
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "TRANSIT":
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const translationKey = getTranslationKey();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
        {getIcon()}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {t(`${translationKey}Title`)}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        {t(`${translationKey}Description`)}
      </p>
    </div>
  );
});
EmptyState.displayName = "EmptyState";

const CarsGrid = memo(({ cars, isLoading, category, sortFn, viewMode }: { cars: Car[]; isLoading: boolean; category: CarCategory; sortFn: (cars: Car[]) => Car[]; viewMode: ViewMode }) => {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  // Ensure cars is always an array
  const safeCars = Array.isArray(cars) ? cars : [];

  if (safeCars.length === 0) {
    return <EmptyState category={category} />;
  }

  const sortedCars = sortFn(safeCars);

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        {sortedCars.map((car) => (
          <CarListItem key={car.id} car={car} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sortedCars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
});
CarsGrid.displayName = "CarsGrid";

export const CarsPage = () => {
  const t = useTranslations("carsPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentCars, arrivingCars, orderCars, isLoading, loadCarsForCategory } = useCarsPage();
  
  // Initialize sort from URL or default to year-newest
  const [activeTab, setActiveTab] = useState<CarCategory>("AVAILABLE");
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const sortFromUrl = searchParams.get("sort") as SortOption;
    return sortFromUrl && ["price-asc", "price-desc", "year-newest", "year-oldest"].includes(sortFromUrl)
      ? sortFromUrl
      : "year-newest";
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTabChange = (category: CarCategory) => {
    setActiveTab(category);
    loadCarsForCategory(category);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
    
    // Update URL with new sort parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`?${params.toString()}`);
  };

  const sortCars = (cars: Car[]): Car[] => {
    if (!Array.isArray(cars)) {
      return [];
    }
    
    const sorted = [...cars];
    switch (sortOption) {
      case "price-asc":
        return sorted.sort((a, b) => a.priceUsd - b.priceUsd);
      case "price-desc":
        return sorted.sort((a, b) => b.priceUsd - a.priceUsd);
      case "year-newest":
        return sorted.sort((a, b) => b.year - a.year);
      case "year-oldest":
        return sorted.sort((a, b) => a.year - b.year);
      default:
        return sorted;
    }
  };

  const getSortLabel = (): string => {
    switch (sortOption) {
      case "price-asc":
        return t("sortOptions.priceAsc");
      case "price-desc":
        return t("sortOptions.priceDesc");
      case "year-newest":
        return t("sortOptions.yearNewest");
      case "year-oldest":
        return t("sortOptions.yearOldest");
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">

      {/* Tabs Section */}
      <Container className="pt-6 sm:pt-8 lg:pt-10 pb-6 sm:pb-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CarCategory)} className="w-full">
          {/* Sort and View Toggle - Above Tabs */}
          <div className="flex items-center gap-3 mb-4">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t("sortAriaLabel")}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all whitespace-nowrap"
                >
                  <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span className="hidden sm:inline">{getSortLabel()}</span>
                  <span className="sm:hidden">{t("sort")}</span>
                  <svg aria-hidden="true" className="w-3.5 h-3.5 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-xl">
                <DropdownMenuItem 
                  onClick={() => handleSortChange("price-asc")} 
                  className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-gray-100 dark:focus:bg-white/10"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <span className="text-sm font-medium">{t("sortOptions.priceAsc")}</span>
                    </div>
                    {sortOption === "price-asc" && (
                      <svg className="w-4 h-4 text-[#429de6]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange("price-desc")} 
                  className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-gray-100 dark:focus:bg-white/10"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                      <span className="text-sm font-medium">{t("sortOptions.priceDesc")}</span>
                    </div>
                    {sortOption === "price-desc" && (
                      <svg className="w-4 h-4 text-[#429de6]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>
                <div className="h-px bg-gray-200 dark:bg-white/10 my-1.5" />
                <DropdownMenuItem 
                  onClick={() => handleSortChange("year-newest")} 
                  className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-gray-100 dark:focus:bg-white/10"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{t("sortOptions.yearNewest")}</span>
                    </div>
                    {sortOption === "year-newest" && (
                      <svg className="w-4 h-4 text-[#429de6]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange("year-oldest")} 
                  className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-gray-100 dark:focus:bg-white/10"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{t("sortOptions.yearOldest")}</span>
                    </div>
                    {sortOption === "year-oldest" && (
                      <svg className="w-4 h-4 text-[#429de6]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle - Hidden on mobile */}
            {!isMobile && (
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "text-gray-900 dark:text-white bg-white dark:bg-white/10 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "text-gray-900 dark:text-white bg-white dark:bg-white/10 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div role="tablist" className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto">
              <button
                role="tab"
                aria-selected={activeTab === "AVAILABLE"}
                onClick={() => handleTabChange("AVAILABLE")}
                className={`relative px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                  activeTab === "AVAILABLE"
                    ? "text-white bg-emerald-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden sm:inline">{t("tabs.current")}</span>
                  <span className="sm:hidden">{t("tabs.currentShort")}</span>
                  {!isLoading("AVAILABLE") && currentCars.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === "AVAILABLE"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {currentCars.length}
                    </span>
                  )}
                </span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === "ONROAD"}
                onClick={() => handleTabChange("ONROAD")}
                className={`relative px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                  activeTab === "ONROAD"
                    ? "text-white bg-amber-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden sm:inline">{t("tabs.arriving")}</span>
                  <span className="sm:hidden">{t("tabs.arrivingShort")}</span>
                  {!isLoading("ONROAD") && arrivingCars.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === "ONROAD"
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                    }`}>
                      {arrivingCars.length}
                    </span>
                  )}
                </span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === "TRANSIT"}
                onClick={() => handleTabChange("TRANSIT")}
                className={`relative px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                  activeTab === "TRANSIT"
                    ? "text-white bg-[#429de6]"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden sm:inline">{t("tabs.order")}</span>
                  <span className="sm:hidden">{t("tabs.orderShort")}</span>
                  {!isLoading("TRANSIT") && orderCars.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === "TRANSIT" 
                        ? "bg-white/20 text-white" 
                        : "bg-blue-100 dark:bg-[#429de6]/20 text-blue-700 dark:text-[#429de6]"
                    }`}>
                      {orderCars.length}
                    </span>
                  )}
                </span>
              </button>
            </div>

          {/* Tab Content */}
          <TabsContent value="AVAILABLE" className="mt-0">
            <CarsGrid cars={currentCars} isLoading={isLoading("AVAILABLE")} category="AVAILABLE" sortFn={sortCars} viewMode={isMobile ? "grid" : viewMode} />
          </TabsContent>

          <TabsContent value="ONROAD" className="mt-0">
            <CarsGrid cars={arrivingCars} isLoading={isLoading("ONROAD")} category="ONROAD" sortFn={sortCars} viewMode={isMobile ? "grid" : viewMode} />
          </TabsContent>

          <TabsContent value="TRANSIT" className="mt-0">
            <CarsGrid cars={orderCars} isLoading={isLoading("TRANSIT")} category="TRANSIT" sortFn={sortCars} viewMode={isMobile ? "grid" : viewMode} />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

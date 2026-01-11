"use client";

import { useTranslations } from "next-intl";

import type { CarCategory, HomeCar } from "@/lib/public/types";

import { HomeCarCard } from "./HomeCarCard";

type HomeCarSectionProps = {
  title: string;
  description: string;
  category: CarCategory;
  cars: HomeCar[];
  isLoading: boolean;
  icon: React.ReactNode;
  accentColor: string;
};

const getSectionGradient = (category: CarCategory): string => {
  const gradients: Record<CarCategory, string> = {
    current: "from-emerald-500/10 via-transparent to-transparent",
    coming: "from-amber-500/10 via-transparent to-transparent",
    order: "from-violet-500/10 via-transparent to-transparent",
  };
  return gradients[category];
};

const getIconBgColor = (category: CarCategory): string => {
  const colors: Record<CarCategory, string> = {
    current: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    coming: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    order: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  };
  return colors[category];
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#111111] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-pulse"
      >
        <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800" />
        <div className="p-5 space-y-3">
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

const EmptyState = ({ category }: { category: CarCategory }) => {
  const t = useTranslations("home.carSections.empty");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`w-16 h-16 rounded-2xl ${getIconBgColor(category)} flex items-center justify-center mb-4`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {t(`${category}Title`)}
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {t(`${category}Description`)}
      </p>
    </div>
  );
};

export const HomeCarSection = ({
  title,
  description,
  category,
  cars,
  isLoading,
  icon,
}: HomeCarSectionProps) => {
  return (
    <section className="relative py-16 lg:py-24">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getSectionGradient(category)} pointer-events-none`}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${getIconBgColor(category)} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg">
                {description}
              </p>
            </div>
          </div>

          {cars && cars.length > 0 && (
            <button className="inline-flex items-center gap-2 text-[#429de6] hover:text-[#3a8acc] font-medium transition-colors group">
              <span>View All</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : !cars || cars.length === 0 ? (
          <EmptyState category={category} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.slice(0, 6).map((car) => (
              <HomeCarCard key={car.id} car={car} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

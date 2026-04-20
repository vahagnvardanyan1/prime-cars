"use client";

import { useTranslations } from "next-intl";
import type { CarCategory } from "@/lib/cars/types";

type BadgeVariant = "compact" | "pill" | "tag";

interface CategoryBadgeProps {
  category: CarCategory;
  variant?: BadgeVariant;
  className?: string;
}

const categoryStyles: Record<CarCategory, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  ONROAD: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  TRANSIT: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const variantStyles: Record<BadgeVariant, string> = {
  compact: "px-2.5 py-1 rounded-full text-xs font-semibold",
  pill: "px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm",
  tag: "px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md",
};

/**
 * Reusable category badge component for displaying car status
 * Provides consistent styling across the application
 */
export const CategoryBadge = ({
  category,
  variant = "compact",
  className = "",
}: CategoryBadgeProps) => {
  const tCarDetails = useTranslations("carDetails");

  const getLabel = () => {
    switch (category) {
      case "AVAILABLE":
        return tCarDetails("badges.available");
      case "ONROAD":
        return tCarDetails("badges.arriving");
      case "TRANSIT":
        return tCarDetails("badges.order");
    }
  };

  return (
    <span
      className={`${variantStyles[variant]} ${categoryStyles[category]} ${className}`.trim()}
    >
      {getLabel()}
    </span>
  );
};

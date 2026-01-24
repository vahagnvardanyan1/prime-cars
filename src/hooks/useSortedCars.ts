import { useMemo } from "react";
import type { Car } from "@/lib/cars/types";

export type SortOption = "price-asc" | "price-desc" | "year-newest" | "year-oldest";

/**
 * Custom hook to sort cars by various criteria
 * Uses useMemo to avoid unnecessary re-sorting on each render
 *
 * @param cars - Array of cars to sort
 * @param sortOption - Sort criteria
 * @returns Sorted array of cars (new array, doesn't mutate original)
 */
export const useSortedCars = (cars: Car[], sortOption: SortOption): Car[] => {
  return useMemo(() => {
    if (!Array.isArray(cars)) return [];

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
  }, [cars, sortOption]);
};

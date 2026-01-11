"use client";

import { useQuery } from "@tanstack/react-query";

import type { Car, CarCategory } from "@/lib/cars/types";
import { fetchCarsByCategory } from "@/lib/cars/fetchCars";

// Query keys for caching
const carsPageKeys = {
  all: ["carsPage"] as const,
  byCategory: (category: CarCategory) => [...carsPageKeys.all, category] as const,
};

export const useCarsPage = () => {
  // Fetch AVAILABLE cars
  const {
    data: currentCars = [],
    isLoading: isLoadingAvailable,
    error: availableError,
    refetch: refetchAvailable,
  } = useQuery({
    queryKey: carsPageKeys.byCategory("AVAILABLE"),
    queryFn: async () => {
      const result = await fetchCarsByCategory({ category: "AVAILABLE" });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch available cars");
      }
      return Array.isArray(result.cars) ? result.cars : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  // Fetch ONROAD cars (lazy loaded)
  const {
    data: arrivingCars = [],
    isLoading: isLoadingOnroad,
    error: onroadError,
    refetch: refetchOnroad,
  } = useQuery({
    queryKey: carsPageKeys.byCategory("ONROAD"),
    queryFn: async () => {
      const result = await fetchCarsByCategory({ category: "ONROAD" });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch onroad cars");
      }
      return Array.isArray(result.cars) ? result.cars : [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    enabled: false, // Don't auto-fetch, load on demand
  });

  // Fetch TRANSIT cars (lazy loaded)
  const {
    data: orderCars = [],
    isLoading: isLoadingTransit,
    error: transitError,
    refetch: refetchTransit,
  } = useQuery({
    queryKey: carsPageKeys.byCategory("TRANSIT"),
    queryFn: async () => {
      const result = await fetchCarsByCategory({ category: "TRANSIT" });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch transit cars");
      }
      return Array.isArray(result.cars) ? result.cars : [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    enabled: false, // Don't auto-fetch, load on demand
  });

  const isLoading = (category: CarCategory) => {
    switch (category) {
      case "AVAILABLE":
        return isLoadingAvailable;
      case "ONROAD":
        return isLoadingOnroad;
      case "TRANSIT":
        return isLoadingTransit;
      default:
        return false;
    }
  };

  const loadCarsForCategory = async (category: CarCategory) => {
    switch (category) {
      case "AVAILABLE":
        return refetchAvailable();
      case "ONROAD":
        return refetchOnroad();
      case "TRANSIT":
        return refetchTransit();
    }
  };

  const errors = [
    availableError ? `AVAILABLE: ${(availableError as Error).message}` : null,
    onroadError ? `ONROAD: ${(onroadError as Error).message}` : null,
    transitError ? `TRANSIT: ${(transitError as Error).message}` : null,
  ].filter(Boolean) as string[];

  return {
    currentCars,
    arrivingCars,
    orderCars,
    isLoading,
    errors,
    loadCarsForCategory,
  };
};

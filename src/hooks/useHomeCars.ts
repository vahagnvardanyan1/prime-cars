"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import type { Car } from "@/lib/cars/types";

export const useHomeCars = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["homeCars", "all"],
    queryFn: async () => {
      const result = await fetchAllAvailableCars();
      if (!result.success) {
        throw new Error(result.error || "Failed to load cars");
      }
      return result.cars || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  return {
    cars: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

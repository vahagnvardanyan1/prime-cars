"use client";

import { useQuery } from "@tanstack/react-query";

import { CACHE_STALE_TIME, CACHE_GC_TIME } from "@/lib/react-query/client";
import { fetchAvailableCarById } from "@/lib/cars/fetchCars";

export const useCarDetails = ({ carId }: { carId: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["carDetails", carId],
    queryFn: async () => {
      const result = await fetchAvailableCarById(carId);
      if (!result.success || !result.car) {
        throw new Error(result.error || "Failed to load car");
      }
      return result.car;
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    retry: 2,
    enabled: !!carId, // Only fetch if carId exists
  });

  return {
    car: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
};

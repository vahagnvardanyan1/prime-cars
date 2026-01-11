"use client";

import { useQuery } from "@tanstack/react-query";

import type { Car } from "@/lib/cars/types";
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    enabled: !!carId, // Only fetch if carId exists
  });

  return {
    car: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
};

"use client";

import { useMemo, useState } from "react";

import type { AdminCar } from "@/lib/admin/types";
import { fetchCars } from "@/lib/admin/fetchCars";
import { toast } from "sonner";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useAdminCarsState = () => {
  const [carsCache, setCarsCache] = useState<{
    data: AdminCar[];
    timestamp: number;
  } | null>(null);

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);

  const openAddCar = () => setIsAddCarOpen(true);
  const closeAddCar = () => setIsAddCarOpen(false);

  const addCar = ({ car }: { car: AdminCar }) => {
    setCars((prev) => [car, ...prev]);
  };

  const isCarsCacheValid = useMemo(() => {
    if (!carsCache) return false;
    const now = Date.now();
    return (now - carsCache.timestamp) < CACHE_DURATION;
  }, [carsCache]);

  const loadCars = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    if (!forceRefresh && carsCache && isCarsCacheValid) {
      setCars(carsCache.data);
      return;
    }

    setIsLoadingCars(true);
    try {
      const result = await fetchCars();
      
      if (result.success && result.cars) {
        setCars(result.cars);
        setCarsCache({
          data: result.cars,
          timestamp: Date.now(),
        });
      } else {
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load cars", {
            description: result.error || "Could not fetch cars from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error("Failed to load cars", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingCars(false);
    }
  };

  return {
    cars,
    isLoadingCars,
    isAddCarOpen,
    openAddCar,
    closeAddCar,
    addCar,
    loadCars,
    isCarsCacheValid,
  };
};


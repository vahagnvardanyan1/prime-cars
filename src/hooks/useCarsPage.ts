"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Car, CarCategory } from "@/lib/cars/types";

import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";

const carsPageKeys = {
  all: ["carsPage", "all"] as const,
};

export const useCarsPage = () => {
  const {
    data,
    isLoading: isLoadingAll,
    error,
    refetch,
  } = useQuery({
    queryKey: carsPageKeys.all,
    queryFn: async () => {
      const result = await fetchAllAvailableCars();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch cars");
      }
      return Array.isArray(result.cars) ? result.cars : [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });

  const [allCars, setAllCars] = useState<Car[]>([]);
  const shuffled = useRef(false);

  useEffect(() => {
    if (data && data.length > 0 && !shuffled.current) {
      shuffled.current = true;
      const arr = [...data];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setAllCars(arr);
    }
  }, [data]);

  const currentCars = useMemo(
    () => allCars.filter((c: Car) => c.category === "AVAILABLE"),
    [allCars]
  );

  const arrivingCars = useMemo(
    () => allCars.filter((c: Car) => c.category === "ONROAD"),
    [allCars]
  );

  const orderCars = useMemo(
    () => allCars.filter((c: Car) => c.category === "TRANSIT"),
    [allCars]
  );

  const isLoading = (_category?: CarCategory) => isLoadingAll;

  const loadCarsForCategory = async (_category: CarCategory) => {
    return refetch();
  };

  const errors = error ? [(error as Error).message] : [];

  return {
    allCars,
    currentCars,
    arrivingCars,
    orderCars,
    isLoading,
    errors,
    loadCarsForCategory,
  };
};

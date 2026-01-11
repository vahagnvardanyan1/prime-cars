"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import type { Car } from "@/lib/cars/types";

type HomeCarsState = {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
};

export const useHomeCars = () => {
  const [state, setState] = useState<HomeCarsState>({
    cars: [],
    isLoading: true,
    error: null,
  });

  const loadCars = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await fetchAllAvailableCars();
    if (result.success) {
      setState({
        cars: result.cars || [],
        isLoading: false,
        error: null,
      });
    } else {
      setState({
        cars: [],
        isLoading: false,
        error: result.error || "Failed to load cars",
      });
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  return {
    ...state,
    refetch: loadCars,
  };
};

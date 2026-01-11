"use client";

import { useCallback, useEffect, useState } from "react";

import type { HomeCar } from "@/lib/public/types";

import { fetchAllHomeCars } from "@/lib/public/fetchHomeCars";

type HomePageCarsState = {
  currentCars: HomeCar[];
  comingCars: HomeCar[];
  orderCars: HomeCar[];
  isLoading: boolean;
  errors: string[];
};

export const useHomePageCars = () => {
  const [state, setState] = useState<HomePageCarsState>({
    currentCars: [],
    comingCars: [],
    orderCars: [],
    isLoading: true,
    errors: [],
  });

  const loadCars = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, errors: [] }));

    const { current, coming, order, errors } = await fetchAllHomeCars();

    setState({
      currentCars: current,
      comingCars: coming,
      orderCars: order,
      isLoading: false,
      errors,
    });
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  return {
    ...state,
    refetch: loadCars,
  };
};

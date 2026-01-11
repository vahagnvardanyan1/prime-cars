"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Car, CarCategory } from "@/lib/cars/types";

import { fetchCarsByCategory } from "@/lib/cars/fetchCars";

type CarsCache = {
  [K in CarCategory]?: Car[];
};

type LoadingState = {
  [K in CarCategory]: boolean;
};

type CarsPageState = {
  currentCars: Car[];
  arrivingCars: Car[];
  orderCars: Car[];
  loadingState: LoadingState;
  errors: string[];
};

export const useCarsPage = () => {
  const [state, setState] = useState<CarsPageState>({
    currentCars: [],
    arrivingCars: [],
    orderCars: [],
    loadingState: {
      AVAILABLE: true,
      ONROAD: false,
      TRANSIT: false,
    },
    errors: [],
  });

  const cacheRef = useRef<CarsCache>({});
  const loadingRef = useRef<Set<CarCategory>>(new Set());
  const hasInitialized = useRef(false);

  const loadCarsForCategory = useCallback(async (category: CarCategory) => {
    // Check if already cached
    if (cacheRef.current[category]) {
      // Already cached, restore from cache to state
      setState((prev) => {
        const newState = { ...prev };
        const cachedCars = cacheRef.current[category] || [];
        // Ensure it's still an array
        const safeCachedCars = Array.isArray(cachedCars) ? cachedCars : [];
        
        if (category === "AVAILABLE") {
          newState.currentCars = safeCachedCars;
        } else if (category === "ONROAD") {
          newState.arrivingCars = safeCachedCars;
        } else if (category === "TRANSIT") {
          newState.orderCars = safeCachedCars;
        }
        
        return newState;
      });
      return;
    }

    // Check if already loading this category
    if (loadingRef.current.has(category)) {
      return;
    }

    // Mark as loading
    loadingRef.current.add(category);

    // Set loading state for this category
    setState((prev) => ({
      ...prev,
      loadingState: {
        ...prev.loadingState,
        [category]: true,
      },
    }));

    const result = await fetchCarsByCategory({ category });

    // Remove from loading set
    loadingRef.current.delete(category);

    if (result.success && result.cars) {
      // Ensure cars is an array
      const carsArray = Array.isArray(result.cars) ? result.cars : [];
      
      // Update cache
      cacheRef.current = {
        ...cacheRef.current,
        [category]: carsArray,
      };

      // Update state based on category
      setState((prev) => {
        const newState = { ...prev };
        if (category === "AVAILABLE") {
          newState.currentCars = carsArray;
        } else if (category === "ONROAD") {
          newState.arrivingCars = carsArray;
        } else if (category === "TRANSIT") {
          newState.orderCars = carsArray;
        }
        newState.loadingState = {
          ...prev.loadingState,
          [category]: false,
        };
        return newState;
      });
    } else {
      // Handle error - set empty array
      setState((prev) => ({
        ...prev,
        loadingState: {
          ...prev.loadingState,
          [category]: false,
        },
        errors: result.error
          ? [...prev.errors, `${category}: ${result.error}`]
          : prev.errors,
      }));
    }
  }, []);

  // Load AVAILABLE cars on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadCarsForCategory("AVAILABLE");
    }
  }, [loadCarsForCategory]);

  const isLoading = (category: CarCategory) => state.loadingState[category];

  return {
    currentCars: Array.isArray(state.currentCars) ? state.currentCars : [],
    arrivingCars: Array.isArray(state.arrivingCars) ? state.arrivingCars : [],
    orderCars: Array.isArray(state.orderCars) ? state.orderCars : [],
    isLoading,
    errors: state.errors,
    loadCarsForCategory,
  };
};

"use client";

import { useEffect, useState } from "react";

import type { Car } from "@/lib/cars/types";

import { fetchCarById } from "@/lib/cars/fetchCars";

export const useCarDetails = ({ carId }: { carId: string }) => {
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchCarById(carId);
      
      if (result.success && result.car) {
        setCar(result.car);
      } else {
        setError(result.error || "Failed to load car");
      }
      
      setIsLoading(false);
    };

    loadCar();
  }, [carId]);

  return { car, isLoading, error };
};
